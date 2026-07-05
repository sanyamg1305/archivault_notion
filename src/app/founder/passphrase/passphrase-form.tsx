"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { unlockFounderMode, type PassphraseState } from "./actions";

export function PassphraseForm() {
  const [state, formAction, pending] = useActionState<
    PassphraseState,
    FormData
  >(unlockFounderMode, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="passphrase">Founder passphrase</Label>
        <Input
          id="passphrase"
          name="passphrase"
          type="password"
          autoComplete="off"
          autoFocus
          required
        />
      </div>
      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Checking…" : "Unlock Founder Mode"}
      </Button>
    </form>
  );
}
