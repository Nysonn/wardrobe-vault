import {
  LISTING_DOCUMENT_ALLOWED_MIME_TYPES,
  LISTING_DOCUMENT_MAX_BYTES,
  LISTING_IMAGE_ALLOWED_MIME_TYPES,
  LISTING_IMAGE_MAX_BYTES,
  LISTING_IMAGE_MIN_LONG_EDGE_PX,
  type ListingDocumentInput,
  type ListingImageInput,
} from "@/lib/schemas/listing";

type ListingImageUploadInput = Omit<ListingImageInput, "width" | "height"> & {
  width?: number;
  height?: number;
};

import {
  CloudinaryConfigError,
  configureCloudinary,
  documentUploadFolder,
  listingUploadFolder,
} from "./config";

type CloudinaryResource = {
  public_id: string;
  bytes: number;
  width?: number;
  height?: number;
  format?: string;
  resource_type?: string;
};

function normalizeFormat(format?: string) {
  if (!format) return "";
  if (format === "jpg") return "jpeg";
  return format.toLowerCase();
}

function mimeFromImageFormat(format: string) {
  return `image/${normalizeFormat(format)}`;
}

function assertFolder(publicId: string, expectedPrefix: string) {
  if (!publicId.startsWith(expectedPrefix)) {
    throw new Error("Upload does not belong to this seller.");
  }
}

async function fetchResource(
  publicId: string,
  resourceType: "image" | "raw" | "auto",
): Promise<CloudinaryResource> {
  try {
    const cloudinary = configureCloudinary();
    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
    });
    return result as CloudinaryResource;
  } catch (error) {
    if (error instanceof CloudinaryConfigError) {
      throw error;
    }
    throw new Error("Could not verify uploaded file with Cloudinary.");
  }
}

export async function validateListingImageUpload(
  userId: string,
  image: ListingImageUploadInput,
): Promise<ListingImageInput> {
  const folder = listingUploadFolder(userId);
  assertFolder(image.cloudinaryPublicId, folder);

  const resource = await fetchResource(image.cloudinaryPublicId, "image");
  const mimeType = mimeFromImageFormat(resource.format ?? "");

  if (
    !LISTING_IMAGE_ALLOWED_MIME_TYPES.includes(
      mimeType as (typeof LISTING_IMAGE_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    throw new Error("Photographs must be JPEG, PNG, or WebP.");
  }

  if (resource.bytes > LISTING_IMAGE_MAX_BYTES) {
    throw new Error("Each photograph must be 10MB or smaller.");
  }

  const width = resource.width ?? image.width;
  const height = resource.height ?? image.height;

  if (!width || !height) {
    throw new Error("Could not determine photograph dimensions.");
  }

  const longEdge = Math.max(width, height);

  if (longEdge < LISTING_IMAGE_MIN_LONG_EDGE_PX) {
    throw new Error(
      `Photographs must be at least ${LISTING_IMAGE_MIN_LONG_EDGE_PX}px on the longest edge.`,
    );
  }

  return {
    ...image,
    width,
    height,
  };
}

export async function validateListingDocumentUpload(
  userId: string,
  document: ListingDocumentInput,
): Promise<ListingDocumentInput> {
  const folder = documentUploadFolder(userId);
  assertFolder(document.cloudinaryPublicId, folder);

  const resourceType =
    document.mimeType === "application/pdf" ? "raw" : "image";
  const resource = await fetchResource(document.cloudinaryPublicId, resourceType);

  const mimeType =
    document.mimeType ??
    (resource.format
      ? resource.format === "pdf"
        ? "application/pdf"
        : mimeFromImageFormat(resource.format)
      : undefined);

  if (
    !mimeType ||
    !LISTING_DOCUMENT_ALLOWED_MIME_TYPES.includes(
      mimeType as (typeof LISTING_DOCUMENT_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    throw new Error("Documents must be JPEG, PNG, WebP, or PDF.");
  }

  if (resource.bytes > LISTING_DOCUMENT_MAX_BYTES) {
    throw new Error("Each document must be 10MB or smaller.");
  }

  return {
    ...document,
    mimeType,
  };
}

export async function validateListingImagesForUser(
  userId: string,
  images: ListingImageUploadInput[],
) {
  return Promise.all(
    images.map((image) => validateListingImageUpload(userId, image)),
  );
}

export async function validateListingDocumentsForUser(
  userId: string,
  documents: ListingDocumentInput[],
) {
  return Promise.all(
    documents.map((document) => validateListingDocumentUpload(userId, document)),
  );
}
