"use client";

import { useState } from "react";
import { Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PricingWaitlist() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  if (joined) {
    return (
      <p
        role="status"
        className="mt-8 rounded-2xl bg-[var(--success-soft)] p-4 text-sm font-semibold text-[var(--success)]"
      >
        <Check className="mr-2 inline size-4" />
        Interesse registado apenas nesta demonstração local.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-3">
      <label>
        <span className="mb-2 block text-xs font-bold">
          Receber convite para entrevistas de validação
        </span>
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="email@consultorio.pt"
        />
      </label>
      <Button
        className="w-full"
        disabled={!email.includes("@")}
        onClick={() => setJoined(true)}
      >
        <Mail className="size-4" />
        Registar interesse
      </Button>
    </div>
  );
}
