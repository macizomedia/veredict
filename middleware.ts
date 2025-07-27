import { auth } from "@/server/auth";

export default auth((req) => {
  // req.auth contains the session information
  // You can add logic here to protect certain routes
  return;
});

export const config = {
  // Matcher configuration to specify which routes should be processed by the middleware
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - api/trpc (tRPC routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|api/trpc|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
