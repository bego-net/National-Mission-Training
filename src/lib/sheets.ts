import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// ── JWT / OAuth helpers ──────────────────────────────────────────────

function base64url(str: string | Buffer): string {
  const buf = typeof str === "string" ? Buffer.from(str) : str;
  return buf.toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getAccessToken(email: string, privateKey: string): Promise<string> {
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const claim = base64url(JSON.stringify({
    iss: email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  }));

  const sign = crypto.createSign("RSA-SHA256");
  sign.update(`${header}.${claim}`);

  // Format key properly to handle escaped newlines
  const formattedKey = privateKey.replace(/\\n/g, "\n");
  const signature = base64url(sign.sign(formattedKey));
  const assertion = `${header}.${claim}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google OAuth failed: ${res.statusText} - ${errText}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

// ── Configuration ────────────────────────────────────────────────────

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000; // 1s, 2s, 4s exponential backoff

interface SheetsConfig {
  email: string;
  privateKey: string;
  sheetId: string;
}

function getSheetsConfig(): SheetsConfig | null {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !privateKey || !sheetId) {
    const missing = [];
    if (!email) missing.push("GOOGLE_SERVICE_ACCOUNT_EMAIL");
    if (!privateKey) missing.push("GOOGLE_PRIVATE_KEY");
    if (!sheetId) missing.push("GOOGLE_SHEET_ID");
    console.warn(`[Sheets Config] Missing env vars: ${missing.join(", ")}. Google Sheets sync disabled.`);
    return null;
  }

  return { email, privateKey, sheetId };
}

// ── Duplicate detection ──────────────────────────────────────────────

/**
 * Checks whether a participant ID already exists in column A of the sheet.
 * Returns true if a duplicate row is found.
 */
async function isDuplicateInSheet(
  token: string,
  sheetId: string,
  participantId: string,
): Promise<boolean> {
  const range = "A:A";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    // If we can't read the sheet, log a warning but don't block — let append proceed.
    console.warn(`[Sheets Duplicate Check] Failed to read column A: ${response.statusText}`);
    return false;
  }

  const data = (await response.json()) as { values?: string[][] };
  if (!data.values) return false;

  return data.values.some((row) => row[0] === participantId);
}

// ── Low-level append with retry ──────────────────────────────────────

async function appendRowWithRetry(
  row: string[],
  config: SheetsConfig,
  participantLabel: string,
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const token = await getAccessToken(config.email, config.privateKey);

      const range = "A:O";
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.sheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: [row] }),
      });

      if (response.status === 429) {
        // Rate limited — always retry
        const retryAfter = response.headers.get("Retry-After");
        const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(`[Sheets Sync] Rate limited (429) for ${participantLabel}. Waiting ${waitMs}ms before retry ${attempt}/${MAX_RETRIES}.`);
        await sleep(waitMs);
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Sheets API ${response.status}: ${response.statusText} - ${errText}`);
      }

      // Success
      console.log(`[Sheets Sync ✓] Appended row for ${participantLabel} (attempt ${attempt}/${MAX_RETRIES}).`);
      return;
    } catch (error: any) {
      lastError = error;
      const delayMs = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      console.error(`[Sheets Sync ✗] Attempt ${attempt}/${MAX_RETRIES} failed for ${participantLabel}: ${error.message}. Retrying in ${delayMs}ms...`);

      if (attempt < MAX_RETRIES) {
        await sleep(delayMs);
      }
    }
  }

  throw lastError ?? new Error("All retry attempts exhausted.");
}

// ── Public API ───────────────────────────────────────────────────────

export interface SyncResult {
  success: boolean;
  participantId: string;
  participantName: string;
  error?: string;
  skippedDuplicate?: boolean;
}

/**
 * The single entry point for syncing a participant to Google Sheets.
 * Handles: config check → duplicate detection → append with retry → sheetSynced flag.
 */
export async function syncParticipantToSheet(participant: {
  id: string;
  fullName: string;
  phone: string;
  age: number;
  gender: string;
  maritalStatus: string;
  occupation: string;
  address: string;
  churchName: string;
  ministryArea: string;
  needsAccommodation: boolean;
  needsTshirt: boolean;
  registrationNumber: string | null;
  createdAt: Date;
}): Promise<SyncResult> {
  const label = `${participant.fullName} (${participant.phone})`;

  const config = getSheetsConfig();
  if (!config) {
    return { success: false, participantId: participant.id, participantName: participant.fullName, error: "Google Sheets credentials not configured." };
  }

  try {
    const token = await getAccessToken(config.email, config.privateKey);

    // ── Duplicate check ──
    const alreadyExists = await isDuplicateInSheet(token, config.sheetId, participant.id);
    if (alreadyExists) {
      console.log(`[Sheets Sync] Skipped duplicate for ${label} — already in sheet.`);
      // Mark as synced in DB even if it was a duplicate (it's already there)
      await prisma.participant.update({
        where: { id: participant.id },
        data: { sheetSynced: true },
      });
      return { success: true, participantId: participant.id, participantName: participant.fullName, skippedDuplicate: true };
    }

    // ── Build row ──
    const row = [
      participant.id,
      participant.registrationNumber ?? "",
      participant.fullName,
      participant.phone,
      String(participant.age),
      participant.gender,
      participant.maritalStatus,
      participant.occupation,
      participant.address,
      participant.churchName,
      participant.ministryArea,
      participant.needsAccommodation ? "Yes" : "No",
      participant.needsTshirt ? "Yes" : "No",
      "Approved",
      participant.createdAt.toLocaleString("en-US", { timeZone: "Africa/Nairobi" }),
    ];

    // ── Append with retry ──
    await appendRowWithRetry(row, config, label);

    // ── Mark synced ──
    await prisma.participant.update({
      where: { id: participant.id },
      data: { sheetSynced: true },
    });

    return { success: true, participantId: participant.id, participantName: participant.fullName };
  } catch (error: any) {
    console.error(`[Sheets Sync FAILED] ${label}: ${error.message}`);
    return { success: false, participantId: participant.id, participantName: participant.fullName, error: error.message };
  }
}

/**
 * Sync all approved participants that are not yet marked as synced.
 * Returns a summary of results.
 */
export async function syncMissingParticipants(): Promise<{
  total: number;
  synced: number;
  skippedDuplicates: number;
  failed: number;
  failures: SyncResult[];
}> {
  const unsynced = await prisma.participant.findMany({
    where: {
      status: "APPROVED",
      sheetSynced: false,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`[Sheets Reconciliation] Found ${unsynced.length} approved participants not yet synced.`);

  let synced = 0;
  let skippedDuplicates = 0;
  let failed = 0;
  const failures: SyncResult[] = [];

  for (const p of unsynced) {
    const result = await syncParticipantToSheet(p);
    if (result.success) {
      if (result.skippedDuplicate) {
        skippedDuplicates++;
      } else {
        synced++;
      }
    } else {
      failed++;
      failures.push(result);
    }

    // Small delay between rows to respect rate limits (100 req/100s for Sheets API)
    await sleep(200);
  }

  console.log(`[Sheets Reconciliation] Done. Synced: ${synced}, Duplicates skipped: ${skippedDuplicates}, Failed: ${failed}.`);

  return { total: unsynced.length, synced, skippedDuplicates, failed, failures };
}

// ── Helpers ──────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
