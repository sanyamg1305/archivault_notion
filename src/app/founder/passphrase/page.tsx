import { KeyRound } from "lucide-react";
import { PassphraseForm } from "./passphrase-form";

export default function FounderPassphrasePage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-muted/40 p-6">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-brand/10 text-brand">
            <KeyRound className="size-5" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">
            Founder Mode
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the shared founder passphrase to continue. This unlocks
            Founder Mode on this device for 12 hours.
          </p>
        </div>
        <PassphraseForm />
      </div>
    </div>
  );
}
