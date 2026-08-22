import { getStreamServerClient } from "./config";

type StreamUserInput = {
  id: string;
  name?: string | null;
  image?: string | null;
};

export async function upsertStreamUsers(users: StreamUserInput[]) {
  const client = getStreamServerClient();

  await client.upsertUsers(
    users.map((user) => ({
      id: user.id,
      name: user.name?.trim() || "Member",
      image: user.image ?? undefined,
      role: "user",
    })),
  );
}
