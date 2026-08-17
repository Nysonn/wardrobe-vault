import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";

export default auth(() => NextResponse.next());

export const config = {
  matcher: ["/admin/:path*"],
};
