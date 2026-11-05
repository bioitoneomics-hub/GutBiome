import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";

const SHARED_SECRET =
  process.env.NIPTON_JWT_SECRET ||
  process.env.ONEOMICS_AUTH_SECRET ||
  process.env.JWT_SECRET ||
  "replace_with_a_very_long_random_secret_string_here_min32chars";

// In-memory set of consumed token identifiers (nonces) to prevent token reuse
// across different tabs or sessions
const consumedJtis = new Set<string>();

// Periodic cleanup of expired nonces (every 30 minutes)
setInterval(() => {
  if (consumedJtis.size > 5000) {
    consumedJtis.clear();
  }
}, 30 * 60 * 1000).unref();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = body?.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { valid: false, message: "Missing or invalid token." },
        { status: 400 }
      );
    }

    const parts = token.trim().split(".");
    if (parts.length !== 3) {
      return NextResponse.json(
        { valid: false, message: "Invalid cryptographic token format." },
        { status: 400 }
      );
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // Verify HMAC-SHA256 signature
    const expectedSig = crypto
      .createHmac("sha256", SHARED_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest("base64url");

    if (signatureB64 !== expectedSig) {
      return NextResponse.json(
        {
          valid: false,
          message: "Cryptographic signature mismatch. Token not authentic.",
        },
        { status: 401 }
      );
    }

    // Decode and parse payload
    let payload: any;
    try {
      const payloadJson = Buffer.from(payloadB64, "base64url").toString("utf-8");
      payload = JSON.parse(payloadJson);
    } catch {
      return NextResponse.json(
        { valid: false, message: "Malformed token payload." },
        { status: 400 }
      );
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return NextResponse.json(
        { valid: false, message: "Launch token has expired. Please launch again from Nipton." },
        { status: 401 }
      );
    }

    // Prevent token reuse across tabs if jti is present
    if (payload.jti) {
      if (consumedJtis.has(payload.jti)) {
        return NextResponse.json(
          {
            valid: false,
            message:
              "This launch token has already been consumed in another session. Opening this link in another tab is prohibited.",
          },
          { status: 403 }
        );
      }
      consumedJtis.add(payload.jti);
    }

    // Validate category or role permission
    const allowed = (payload.allowed_categories || "").toLowerCase();
    const isAuthorized =
      payload.role === "admin" ||
      allowed.includes("dtc") ||
      payload.category === "dtc" ||
      payload.scope === "gutbiome" ||
      payload.scope === "peptide_studio";

    if (!isAuthorized) {
      return NextResponse.json(
        {
          valid: false,
          message: "Insufficient permissions: DTC category access required.",
        },
        { status: 403 }
      );
    }

    // The launch token has a 10-minute window to be consumed.
    // Once verified, grant a full 8-hour continuous working session in this tab!
    const sessionDurationMs = 8 * 60 * 60 * 1000;
    return NextResponse.json({
      valid: true,
      user: {
        username: payload.username || "OneOmics User",
        role: payload.role || "user",
        category: "dtc",
      },
      expiresAt: Date.now() + sessionDurationMs,
    });
  } catch (err: any) {
    console.error("Token verification exception:", err);
    return NextResponse.json(
      { valid: false, message: "Internal verification error." },
      { status: 500 }
    );
  }
}

