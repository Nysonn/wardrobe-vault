import { v2 as cloudinary } from "cloudinary";

export class CloudinaryConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CloudinaryConfigError";
  }
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new CloudinaryConfigError(
      `${name} is not configured. Add Cloudinary credentials to your environment.`,
    );
  }
  return value;
}

export function getCloudinaryConfig() {
  return {
    cloudName: requireEnv("CLOUDINARY_CLOUD_NAME"),
    apiKey: requireEnv("CLOUDINARY_API_KEY"),
    apiSecret: requireEnv("CLOUDINARY_API_SECRET"),
  };
}

export function configureCloudinary() {
  const config = getCloudinaryConfig();
  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true,
  });
  return cloudinary;
}

export function listingUploadFolder(userId: string) {
  return `wardrobe-vault/listings/${userId}`;
}

export function documentUploadFolder(userId: string) {
  return `wardrobe-vault/documents/${userId}`;
}
