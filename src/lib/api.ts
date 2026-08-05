import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return jsonError("Please log in to continue", 401);
    }
    if (error.message === "FORBIDDEN") {
      return jsonError("Admin access required", 403);
    }
    if (
      error.message.includes("JWT_SECRET") ||
      error.message.includes("MONGODB_URI")
    ) {
      console.error(error);
      return jsonError(
        "Server misconfigured. Set JWT_SECRET and MONGODB_URI in Vercel env vars.",
        500,
      );
    }
    if (
      /timed out|ECONNREFUSED|Server selection|MongoNetwork/i.test(
        error.message,
      )
    ) {
      console.error(error);
      return jsonError(
        "Database unavailable. Check MongoDB URI and Atlas network access.",
        500,
      );
    }
  }
  console.error(error);
  return jsonError("Something went wrong", 500);
}
