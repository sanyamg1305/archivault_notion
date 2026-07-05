import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "founder_unlock";
const UNLOCK_HOURS = 12;

function getSecretKey() {
  const secret = process.env.FOUNDER_SESSION_SECRET;
  if (!secret) {
    throw new Error("FOUNDER_SESSION_SECRET env var is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function verifyFounderPassphrase(input: string): Promise<boolean> {
  const hash = process.env.FOUNDER_PASSPHRASE_HASH;
  if (!hash) {
    throw new Error("FOUNDER_PASSPHRASE_HASH env var is not set");
  }
  return bcrypt.compare(input, hash);
}

// One shared passphrase unlocks Founder Mode for anyone who knows it — there's
// no individual founder login, so this cookie just means "unlocked," not
// "unlocked as a specific person."
export async function setFounderUnlockCookie() {
  const token = await new SignJWT({ unlocked: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${UNLOCK_HOURS}h`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: UNLOCK_HOURS * 60 * 60,
  });
}

export async function clearFounderUnlockCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Secure, server-side check (verifies JWT signature + expiry) — call this
// from every founder page/action, not just the layout, since Next.js
// layouts don't necessarily re-run on every client-side navigation.
export async function isFounderUnlocked(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}
