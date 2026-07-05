import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "founder_unlock";

// Optimistic check only (fast cookie-presence check on every request). The
// real, signature-verified check happens server-side in founder/layout.tsx
// and in every founder server action — this just avoids a round trip for
// the common case of an already-locked visitor.
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith("/founder") && path !== "/founder/passphrase") {
    const hasCookie = request.cookies.has(COOKIE_NAME);
    if (!hasCookie) {
      return NextResponse.redirect(new URL("/founder/passphrase", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/founder/:path*"],
};
