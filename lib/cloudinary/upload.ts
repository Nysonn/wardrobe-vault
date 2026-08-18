import {
  LISTING_DOCUMENT_ALLOWED_MIME_TYPES,
  LISTING_DOCUMENT_MAX_BYTES,
  LISTING_IMAGE_ALLOWED_MIME_TYPES,
  LISTING_IMAGE_MAX_BYTES,
  LISTING_IMAGE_MIN_LONG_EDGE_PX,
  type ListingDocumentInput,
  type ListingImageInput,
} from "@/lib/schemas/listing";

export type UploadError = { message: string };

type SignResponse = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
};

async function getSignature(folder: "listing" | "document"): Promise<SignResponse> {
  const res = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });

  if (!res.ok) {
    const { error } = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(error ?? "Upload service is unavailable. Try again.");
  }

  return res.json() as Promise<SignResponse>;
}

/** Resolves image dimensions via a browser Image element. */
function resolveImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image dimensions."));
    };
    img.src = url;
  });
}

/** Client-side validation for listing images before upload. */
export async function validateImageFile(
  file: File,
): Promise<UploadError | null> {
  if (
    !LISTING_IMAGE_ALLOWED_MIME_TYPES.includes(
      file.type as (typeof LISTING_IMAGE_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    return { message: `${file.name}: only JPEG, PNG, or WebP photographs are accepted.` };
  }

  if (file.size > LISTING_IMAGE_MAX_BYTES) {
    return { message: `${file.name}: photographs must be 10 MB or smaller.` };
  }

  try {
    const { width, height } = await resolveImageDimensions(file);
    if (Math.max(width, height) < LISTING_IMAGE_MIN_LONG_EDGE_PX) {
      return {
        message: `${file.name}: photographs must be at least ${LISTING_IMAGE_MIN_LONG_EDGE_PX}px on the longest edge.`,
      };
    }
  } catch {
    return { message: `${file.name}: could not read image dimensions.` };
  }

  return null;
}

/** Client-side validation for listing documents before upload. */
export function validateDocumentFile(file: File): UploadError | null {
  if (
    !LISTING_DOCUMENT_ALLOWED_MIME_TYPES.includes(
      file.type as (typeof LISTING_DOCUMENT_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    return { message: `${file.name}: only JPEG, PNG, WebP, or PDF documents are accepted.` };
  }

  if (file.size > LISTING_DOCUMENT_MAX_BYTES) {
    return { message: `${file.name}: documents must be 10 MB or smaller.` };
  }

  return null;
}

type CloudinaryUploadResponse = {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
};

async function uploadToCloudinary(
  file: File,
  sign: SignResponse,
  resourceType: "image" | "raw",
): Promise<CloudinaryUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", sign.folder);
  formData.append("timestamp", String(sign.timestamp));
  formData.append("api_key", sign.apiKey);
  formData.append("signature", sign.signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sign.cloudName}/${resourceType}/upload`,
    { method: "POST", body: formData },
  );

  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(json.error?.message ?? `Upload failed for ${file.name}.`);
  }

  return res.json() as Promise<CloudinaryUploadResponse>;
}

/**
 * Validate, then upload a listing image directly to Cloudinary.
 * Returns a `ListingImageInput` ready to be stored in form state.
 */
export async function uploadListingImage(
  file: File,
  sortOrder: number,
): Promise<ListingImageInput> {
  const validationError = await validateImageFile(file);
  if (validationError) throw new Error(validationError.message);

  const { width: localWidth, height: localHeight } =
    await resolveImageDimensions(file);

  const sign = await getSignature("listing");
  const result = await uploadToCloudinary(file, sign, "image");

  return {
    cloudinaryPublicId: result.public_id,
    url: result.secure_url,
    width: result.width ?? localWidth,
    height: result.height ?? localHeight,
    sortOrder,
    altText: undefined,
  };
}

/**
 * Validate, then upload a listing document directly to Cloudinary.
 * Returns a `ListingDocumentInput` ready to be stored in form state.
 */
export async function uploadListingDocument(
  file: File,
  docType: string,
): Promise<ListingDocumentInput> {
  const validationError = validateDocumentFile(file);
  if (validationError) throw new Error(validationError.message);

  const resourceType = file.type === "application/pdf" ? "raw" : "image";
  const sign = await getSignature("document");
  const result = await uploadToCloudinary(file, sign, resourceType);

  return {
    cloudinaryPublicId: result.public_id,
    url: result.secure_url,
    type: docType as ListingDocumentInput["type"],
    fileName: file.name,
    mimeType: file.type,
  };
}
