"use client";

import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { uploadVerificationEvidence } from "@/lib/cloudinary/upload";
import {
  VERIFICATION_EVIDENCE_MAX_COUNT,
  type VerificationEvidenceInput,
} from "@/lib/schemas/verification";

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; fileName: string }
  | { status: "error"; message: string };

type Props = {
  value: VerificationEvidenceInput[];
  onChange: (evidence: VerificationEvidenceInput[]) => void;
};

export function VerificationEvidenceUploader({ value, onChange }: Props) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });

  const atMax = value.length >= VERIFICATION_EVIDENCE_MAX_COUNT;
  const uploading = uploadState.status === "uploading";

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const available = VERIFICATION_EVIDENCE_MAX_COUNT - value.length;
    if (available <= 0) return;

    const toUpload = Array.from(files).slice(0, available);
    const results: VerificationEvidenceInput[] = [...value];

    for (const file of toUpload) {
      setUploadState({ status: "uploading", fileName: file.name });
      try {
        const uploaded = await uploadVerificationEvidence(file);
        results.push(uploaded);
      } catch (err) {
        setUploadState({
          status: "error",
          message:
            err instanceof Error
              ? "We couldn't upload that file. Please try a smaller image or PDF."
              : "We couldn't upload that file. Please try again.",
        });
        onChange(results);
        return;
      }
    }

    setUploadState({ status: "idle" });
    onChange(results);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    void handleFiles(event.target.files);
    event.target.value = "";
  }

  return (
    <div className="space-y-3">
      {!atMax && (
        <div>
          <input
            id={inputId}
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            multiple
            className="sr-only"
            onChange={handleInputChange}
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading
              ? `Uploading ${uploadState.status === "uploading" ? uploadState.fileName : ""}…`
              : "Upload evidence"}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            JPEG, PNG, WebP, or PDF — up to 10 MB each. Maximum{" "}
            {VERIFICATION_EVIDENCE_MAX_COUNT} files.
          </p>
        </div>
      )}

      {uploadState.status === "error" ? (
        <p className="text-sm text-destructive">{uploadState.message}</p>
      ) : null}

      {value.length > 0 ? (
        <ul className="divide-y divide-border border border-border">
          {value.map((item, index) => (
            <li
              key={`${item.url}-${index}`}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
            >
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate underline-offset-4 hover:underline"
              >
                {item.fileName}
              </a>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  onChange(value.filter((_, i) => i !== index))
                }
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
