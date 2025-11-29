// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",             // home page
  "/sign-in(.*)",  // Clerk sign-in
  "/sign-up(.*)",  // Clerk sign-up
]);

export default clerkMiddleware(async (auth, req) => {
  // protect everything that is NOT public
  if (!isPublicRoute(req)) {
    await auth.protect();   // ✅ correct usage
  }
});

export const config = {
  matcher: [
    // run middleware for all app routes, but skip _next/static etc.
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
