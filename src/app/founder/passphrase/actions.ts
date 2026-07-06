"use server";

import { redirect } from "next/navigation";
import { checkFounderPassphrase, setFounderUnlockCookie } from "@/lib/founder-passphrase";

export type PassphraseState = { error?: string } | undefined;

export async function unlockFounderMode(
  _prevState: PassphraseState,
  formData: FormData
): Promise<PassphraseState> {
  const passphrase = String(formData.get("passphrase") ?? "");
  const result = await checkFounderPassphrase(passphrase);

  if (!result.ok) {
    if (result.locked) {
      const unit = result.retryAfterMinutes === 1 ? "minute" : "minutes";
      return {
        error: `Too many incorrect attempts. Try again in ${result.retryAfterMinutes} ${unit}.`,
      };
    }
    return { error: "Incorrect passphrase." };
  }

  await setFounderUnlockCookie();
  redirect("/founder/team-tracker");
}
