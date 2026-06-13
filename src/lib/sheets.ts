import crypto from "crypto";

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

export async function appendToGoogleSheets(row: string[]): Promise<boolean> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !privateKey || !sheetId) {
    console.warn("Google Sheets credentials are not fully configured. Skipping sheet sync.");
    return false;
  }

  try {
    const token = await getAccessToken(email, privateKey);
    const range = "A:N"; // Appends to the first sheet, columns A to N
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [row],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Google Sheets append failed: ${response.statusText} - ${errText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Google Sheets integration failed:", error);
    return false;
  }
}
