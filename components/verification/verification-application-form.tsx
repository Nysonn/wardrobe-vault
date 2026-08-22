"use client";

import { useActionState, useState } from "react";

import {
  submitVerificationApplicationAction,
  type VerificationActionState,
} from "@/app/actions/verification";
import { VerificationEvidenceUploader } from "@/components/verification/evidence-uploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { VerificationEvidenceInput } from "@/lib/schemas/verification";

const initialState: VerificationActionState = {};

export function VerificationApplicationForm() {
  const [state, formAction, pending] = useActionState(
    submitVerificationApplicationAction,
    initialState,
  );
  const [evidence, setEvidence] = useState<VerificationEvidenceInput[]>([]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="evidenceUrls" value={JSON.stringify(evidence)} />

      <div className="space-y-2">
        <Label htmlFor="applicationNotes">Why are you requesting verification?</Label>
        <Textarea
          id="applicationNotes"
          name="applicationNotes"
          rows={5}
          required
          placeholder="Describe your public profile, career, or notability. This helps our team understand your application."
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="evidenceSummary">Evidence summary</Label>
        <Textarea
          id="evidenceSummary"
          name="evidenceSummary"
          rows={4}
          required
          placeholder="Summarise what you are submitting — press coverage, event photographs, ownership documents, and so on."
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <Label>Supporting evidence</Label>
        <VerificationEvidenceUploader value={evidence} onChange={setEvidence} />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      {state.success ? (
        <p className="border border-border bg-muted/40 px-4 py-3 text-sm leading-relaxed">
          Your application has been submitted. We will review your evidence and
          notify you when a decision is made.
        </p>
      ) : (
        <Button type="submit" disabled={pending || evidence.length === 0}>
          {pending ? "Submitting…" : "Submit for review"}
        </Button>
      )}
    </form>
  );
}
