export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/notes/:path*",
    // Add other protected routes here
  ],
};