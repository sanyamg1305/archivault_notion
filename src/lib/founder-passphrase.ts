import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "founder_unlock";
const UNLOCK_HOURS = 12;

const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MINUTES = 15;
const LOCKOUT_MINUTES = 15;

function getSecretKey() {
  const secret = process.env.FOUNDER_SESSION_SECRET;
  if (!secret) {
    throw new Error("FOUNDER_SESSION_SECRET env var is not set");
  }
  return new TextEncoder().encode(secret);
}

async function getClientIp(): Promise<string> {
  const h = await headers();
  // Vercel/most proxies set x-forwarded-for as "client, proxy1, proxy2…"
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

export type PassphraseCheckResult =
  | { ok: true }
  | { ok: false; locked: true; retryAfterMinutes: number }
  | { ok: false; locked: false };

// Brute-force guard: after MAX_ATTEMPTS wrong guesses from the same IP within
// ATTEMPT_WINDOW_MINUTES, that IP is locked out for LOCKOUT_MINUTES —
// regardless of whether the passphrase they eventually try is correct.
export async function checkFounderPassphrase(input: string): Promise<PassphraseCheckResult> {
  const ip = await getClientIp();
  const now = new Date();

  const existing = await prisma.passphraseAttempt.findUnique({ where: { ip } });

  if (existing?.lockedUntil && existing.lockedUntil > now) {
    const retryAfterMinutes = Math.ceil((existing.lockedUntil.getTime() - now.getTime()) / 60000);
    return { ok: false, locked: true, retryAfterMinutes };
  }

  const hash = process.env.FOUNDER_PASSPHRASE_HASH;
  if (!hash) {
    throw new Error("FOUNDER_PASSPHRASE_HASH env var is not set");
  }
  const correct = await bcrypt.compare(input, hash);

  if (correct) {
    if (existing) await prisma.passphraseAttempt.delete({ where: { ip } });
    return { ok: true };
  }

  const windowExpired =
    !existing ||
    now.getTime() - existing.firstAttemptAt.getTime() > ATTEMPT_WINDOW_MINUTES * 60000;

  const nextCount = windowExpired ? 1 : existing.count + 1;
  const lockedUntil =
    nextCount >= MAX_ATTEMPTS ? new Date(now.getTime() + LOCKOUT_MINUTES * 60000) : null;

  await prisma.passphraseAttempt.upsert({
    where: { ip },
    create: { ip, count: nextCount, firstAttemptAt: now, lockedUntil },
    update: {
      count: nextCount,
      firstAttemptAt: windowExpired ? now : undefined,
      lockedUntil,
    },
  });

  return { ok: false, locked: false };
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
