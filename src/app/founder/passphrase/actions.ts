"use server";

import { redirect } from "next/navigation";
import {
  verifyFounderPassphrase,
  setFounderUnlockCookie,
} from "@/lib/founder-passphrase";

export type PassphraseState = { error?: string } | undefined;

export async function unlockFounderMode(
  _prevState: PassphraseState,
  formData: FormData
): Promise<PassphraseState> {
  const passphrase = String(formData.get("passphrase") ?? "");
  const ok = await verifyFounderPassphrase(passphrase);

  if (!ok) {
    return { error: "Incorrect passphrase." };
  }

  await setFounderUnlockCookie();
  redirect("/founder/team-tracker");
}
