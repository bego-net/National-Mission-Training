/**
 * scripts/sync-sheets.ts
 *
 * CLI script to reconcile Neon ↔ Google Sheets.
 * Finds all APPROVED participants not yet synced and pushes them to the sheet.
 *
 * Usage:
 *   npx tsx scripts/sync-sheets.ts            # Run reconciliation
 *   npx tsx scripts/sync-sheets.ts --dry-run   # Preview only
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Re-use core logic from src/lib/sheets.ts (inlined for standalone use) ──

import crypto from "crypto";

function base64url(str: string | Buffer): string {
  const buf = typeof str === "string" ? Buffer.from(str) : str;
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
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
  const formattedKey = privateKey.replace(/\\n/g, "\n");
  const signature = base64url(sign.sign(formattedKey));

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claim}.${signature}`,
    }),
  });

  if (!res.ok) throw new Error(`OAuth failed: ${await res.text()}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Main ──

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !privateKey || !sheetId) {
    console.error("❌ Missing Google Sheets env vars. Set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID.");
    process.exit(1);
  }

  const unsynced = await prisma.participant.findMany({
    where: { status: "APPROVED", sheetSynced: false },
    orderBy: { createdAt: "asc" },
  });

  const totalApproved = await prisma.participant.count({ where: { status: "APPROVED" } });
  const totalSynced = await prisma.participant.count({ where: { status: "APPROVED", sheetSynced: true } });

  console.log(`\n📊  Neon DB Status`);
  console.log(`   Total approved:  ${totalApproved}`);
  console.log(`   Already synced:  ${totalSynced}`);
  console.log(`   Missing in sheet: ${unsynced.length}\n`);

  if (unsynced.length === 0) {
    console.log("✅ All approved participants are already synced. Nothing to do.");
    return;
  }

  if (dryRun) {
    console.log("🔍 Dry-run mode — listing unsynced participants:\n");
    for (const p of unsynced) {
      console.log(`   • ${p.registrationNumber ?? "—"} | ${p.fullName} | ${p.phone}`);
    }
    console.log(`\nRun without --dry-run to sync these ${unsynced.length} participants.`);
    return;
  }

  // Get token and read existing IDs from column A for dedup
  const token = await getAccessToken(email, privateKey);

  const readRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A:A`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const existingIds = new Set<string>();
  if (readRes.ok) {
    const data = (await readRes.json()) as { values?: string[][] };
    for (const row of data.values ?? []) {
      if (row[0]) existingIds.add(row[0]);
    }
  }

  let synced = 0;
  let skipped = 0;
  let failed = 0;

  for (const p of unsynced) {
    // Duplicate check
    if (existingIds.has(p.id)) {
      console.log(`  ⏭  Skipped (duplicate): ${p.fullName}`);
      await prisma.participant.update({ where: { id: p.id }, data: { sheetSynced: true } });
      existingIds.add(p.id);
      skipped++;
      continue;
    }

    const tShirtValue = p.needsTshirt
      ? (p.tShirtSize ? `Yes (${p.tShirtSize})` : "Yes")
      : "No";

    const row = [
      p.id,
      p.registrationNumber ?? "",
      p.fullName,
      p.phone,
      String(p.age),
      p.gender,
      p.maritalStatus,
      p.occupation,
      p.address,
      p.churchName,
      p.ministryArea,
      p.needsAccommodation ? "Yes" : "No",
      tShirtValue,
      "Approved",
      p.createdAt.toLocaleString("en-US", { timeZone: "Africa/Nairobi" }),
    ];

    let success = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const freshToken = await getAccessToken(email, privateKey);
        const appendRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A:O:append?valueInputOption=USER_ENTERED`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${freshToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ values: [row] }),
          },
        );

        if (appendRes.status === 429) {
          console.warn(`  ⏳ Rate limited. Waiting 5s...`);
          await sleep(5000);
          continue;
        }

        if (!appendRes.ok) {
          throw new Error(`${appendRes.status} ${await appendRes.text()}`);
        }

        success = true;
        break;
      } catch (err: any) {
        console.error(`  ❌ Attempt ${attempt}/3 failed for ${p.fullName}: ${err.message}`);
        if (attempt < 3) await sleep(1000 * Math.pow(2, attempt - 1));
      }
    }

    if (success) {
      await prisma.participant.update({ where: { id: p.id }, data: { sheetSynced: true } });
      existingIds.add(p.id);
      synced++;
      console.log(`  ✅ Synced: ${p.registrationNumber ?? "—"} | ${p.fullName}`);
    } else {
      failed++;
      console.error(`  ❌ FAILED after 3 retries: ${p.fullName} (${p.phone})`);
    }

    await sleep(200); // Respect rate limits
  }

  console.log(`\n📋 Reconciliation complete`);
  console.log(`   Synced:   ${synced}`);
  console.log(`   Skipped:  ${skipped} (already in sheet)`);
  console.log(`   Failed:   ${failed}`);

  if (failed > 0) {
    console.log(`\n⚠️  ${failed} participant(s) failed. Re-run the script to retry.`);
  }
}

main()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
