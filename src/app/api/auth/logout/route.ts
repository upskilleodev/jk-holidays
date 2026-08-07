import { z } from "zod";
import { clearSessionCookie, type SessionScope } from "@/lib/auth";
import { jsonOk } from "@/lib/api";

const schema = z.object({
  scope: z.enum(["member", "admin", "all"]).optional(),
});

export async function POST(request: Request) {
  let scope: SessionScope | "all" = "all";
  try {
    const body = schema.parse(await request.json().catch(() => ({})));
    scope = body.scope || "all";
  } catch {
    scope = "all";
  }

  await clearSessionCookie(scope);
  return jsonOk({ success: true });
}
