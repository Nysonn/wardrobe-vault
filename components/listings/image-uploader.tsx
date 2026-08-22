"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { uploadListingImage } from "@/lib/cloudinary/upload";
import {
  LISTING_IMAGE_MAX_COUNT,
  type ListingImageDraftInput,
} from "@/lib/schemas/listing";

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; fileName: string }
  | { status: "error"; message: string };

type Props = {
  value: ListingImageDraftInput[];
  onChange: (images: ListingImageDraftInput[]) => void;
};

export function ImageUploader({ value, onChange }: Props) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });

  const atMax = value.length >= LISTING_IMAGE_MAX_COUNT;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const available = LISTING_IMAGE_MAX_COUNT - value.length;
    if (available <= 0) return;

    const toUpload = Array.from(files).slice(0, available);
    const results: ListingImageDraftInput[] = [...value];

    for (const file of toUpload) {
      setUploadState({ status: "uploading", fileName: file.name });
      try {
        const uploaded = await uploadListingImage(file, results.length);
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
    // Reset input so the same file can be re-selected after removal
    event.target.value = "";
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    void handleFiles(event.dataTransfer.files);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function removeImage(index: number) {
    const next = value
      .filter((_, i) => i !== index)
      .map((img, i) => ({ ...img, sortOrder: i }));
    onChange(next);
  }

  function moveImage(from: number, to: number) {
    const next = [...value];
    const [item] = next.splice(from, 1);
    if (!item) return;
    next.splice(to, 0, item);
    onChange(next.map((img, i) => ({ ...img, sortOrder: i })));
  }

  const uploading = uploadState.status === "uploading";

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {!atMax && (
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors hover:bg-muted/60"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          aria-label="Upload photographs"
        >
          <p className="text-sm font-medium text-foreground">
            {uploading
              ? `Uploading ${uploadState.fileName}…`
              : "Drop photographs here, or click to select"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPEG, PNG, or WebP · max 10 MB · min 1200px on longest edge ·{" "}
            {LISTING_IMAGE_MAX_COUNT - value.length} remaining
          </p>
          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            className="sr-only"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={uploading}
            onChange={handleInputChange}
          />
        </div>
      )}

      {/* Error */}
      {uploadState.status === "error" && (
        <p className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {uploadState.message}
        </p>
      )}

      {/* Uploaded images */}
      {value.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {value.map((img, index) => (
            <li key={img.cloudinaryPublicId} className="group relative aspect-square">
              <Image
                src={img.url}
                alt={img.altText ?? `Photograph ${index + 1}`}
                fill
                sizes="160px"
                className="rounded-sm object-cover"
              />
              {/* Reorder / remove overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-sm bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index - 1)}
                    className="rounded-sm bg-white/90 px-1.5 py-0.5 text-xs font-medium text-zinc-900 hover:bg-white"
                    aria-label="Move left"
                  >
                    ←
                  </button>
                )}
                {index < value.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index + 1)}
                    className="rounded-sm bg-white/90 px-1.5 py-0.5 text-xs font-medium text-zinc-900 hover:bg-white"
                    aria-label="Move right"
                  >
                    →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="rounded-sm bg-white/90 px-1.5 py-0.5 text-xs font-medium text-red-700 hover:bg-white"
                  aria-label="Remove photograph"
                >
                  ✕
                </button>
              </div>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 rounded-sm bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Cover
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {atMax && (
        <p className="text-xs text-muted-foreground">
          Maximum of {LISTING_IMAGE_MAX_COUNT} photographs reached.{" "}
          <Button
            type="button"
            variant="ghost"
            className="h-auto p-0 text-xs underline"
            onClick={() => onChange([])}
          >
            Remove all
          </Button>
        </p>
      )}
    </div>
  );
}
