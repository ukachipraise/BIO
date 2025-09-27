
"use client";

import { Fingerprint, Loader2 } from "lucide-react";

export function LoadingView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="relative flex items-center justify-center w-32 h-32">
        <Fingerprint className="w-24 h-24 text-primary animate-pulse" />
        <Loader2 className="absolute w-32 h-32 text-primary/30 animate-spin" />
      </div>
      <h2 className="mt-8 text-xl font-semibold tracking-tight text-foreground">
        Initializing Biometric System...
      </h2>
      <p className="mt-2 text-muted-foreground">Please wait while we connect to devices.</p>
    </div>
  );
}
