"use client";

import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { uploadListingDocument } from "@/lib/cloudinary/upload";
import {
  LISTING_DOCUMENT_MAX_COUNT,
  LISTING_DOCUMENT_TYPE_LABELS,
  type ListingDocumentInput,
} from "@/lib/schemas/listing";
import { ListingDocumentType } from "@/lib/generated/prisma/enums";

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; fileName: string }
  | { status: "error"; message: string };

type Props = {
  value: ListingDocumentInput[];
  onChange: (docs: ListingDocumentInput[]) => void;
};

export function DocumentUploader({ value, onChange }: Props) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });
  const [selectedType, setSelectedType] = useState<ListingDocumentType>(
    ListingDocumentType.PROOF_OF_PURCHASE,
  );

  const atMax = value.length >= LISTING_DOCUMENT_MAX_COUNT;
  const uploading = uploadState.status === "uploading";

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const available = LISTING_DOCUMENT_MAX_COUNT - value.length;
    if (available <= 0) return;

    const toUpload = Array.from(files).slice(0, available);
    const results: ListingDocumentInput[] = [...value];

    for (const file of toUpload) {
      setUploadState({ status: "uploading", fileName: file.name });
      try {
        const uploaded = await uploadListingDocument(file, selectedType);
        results.push(uploaded);
      } catch (err) {
        setUploadState({
          status: "error",
          message: err instanceof Error ? err.message : "Upload failed.",
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

  function removeDocument(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {/* Type selector + upload button */}
      {!atMax && (
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <label
              htmlFor={`${inputId}-type`}
              className="text-xs font-medium text-muted-foreground"
            >
              Document type
            </label>
            <select
              id={`${inputId}-type`}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ListingDocumentType)}
              className="flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {Object.entries(LISTING_DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? `Uploading ${uploadState.fileName}…` : "Add document"}
          </Button>
          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            className="sr-only"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            multiple
            disabled={uploading}
            onChange={handleInputChange}
          />
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        JPEG, PNG, WebP, or PDF · max 10 MB per file · up to {LISTING_DOCUMENT_MAX_COUNT} documents
      </p>

      {/* Error */}
      {uploadState.status === "error" && (
        <p className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {uploadState.message}
        </p>
      )}

      {/* Uploaded documents */}
      {value.length > 0 && (
        <ul className="divide-y divide-border rounded-sm border border-border">
          {value.map((doc, index) => (
            <li
              key={doc.cloudinaryPublicId}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {doc.fileName ?? "Document"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {LISTING_DOCUMENT_TYPE_LABELS[doc.type]}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeDocument(index)}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
