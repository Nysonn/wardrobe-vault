import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth/config";
import {
  documentUploadFolder,
  getCloudinaryConfig,
  listingUploadFolder,
} from "@/lib/cloudinary/config";

const signRequestSchema = z.object({
  folder: z.enum(["listing", "document"]),
});

/**
 * POST /api/cloudinary/sign
 *
 * Returns a signed set of upload params so the browser can upload directly
 * to Cloudinary without exposing CLOUDINARY_API_SECRET client-side.
 *
 * Body: { folder: "listing" | "document" }
 * Response: { signature, timestamp, apiKey, cloudName, folder }
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = signRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  let config: ReturnType<typeof getCloudinaryConfig>;
  try {
    config = getCloudinaryConfig();
  } catch {
    return NextResponse.json(
      { error: "Upload service is not configured." },
      { status: 503 },
    );
  }

  const folder =
    parsed.data.folder === "listing"
      ? listingUploadFolder(session.user.id)
      : documentUploadFolder(session.user.id);

  const timestamp = Math.floor(Date.now() / 1000);

  // Sign: Cloudinary signature = SHA-1 of sorted params + api_secret
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + config.apiSecret)
    .digest("hex");

  return NextResponse.json({
    signature,
    timestamp,
    apiKey: config.apiKey,
    cloudName: config.cloudName,
    folder,
  });
}
