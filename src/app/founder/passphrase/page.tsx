import { KeyRound } from "lucide-react";
import { PassphraseForm } from "./passphrase-form";

export default function FounderPassphrasePage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-sidebar p-6">
      <div className="w-full max-w-sm rounded-3xl border border-white/[0.06] bg-card p-9 shadow-2xl">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <KeyRound className="size-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Founder Mode
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the shared founder passphrase to continue. This unlocks
            Founder Mode on this device for 12 hours.
          </p>
        </div>
        <PassphraseForm />
      </div>
    </div>
  );
}
