import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";
import {
  getStreamChatApiKey,
  getStreamServerClient,
  StreamChatConfigError,
} from "@/lib/stream/config";
import { upsertStreamUsers } from "@/lib/stream/users";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = getStreamServerClient();

    await upsertStreamUsers([
      {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image,
      },
    ]);

    const token = client.createToken(session.user.id);

    return NextResponse.json({
      apiKey: getStreamChatApiKey(),
      token,
      user: {
        id: session.user.id,
        name: session.user.name ?? "Member",
        image: session.user.image ?? undefined,
      },
    });
  } catch (error) {
    if (error instanceof StreamChatConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    throw error;
  }
}
