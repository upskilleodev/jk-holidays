import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, handleRouteError } from "@/lib/api";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const form = await request.formData();
    const files = form.getAll("files").filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return jsonError("Choose at least one photo");
    }
    if (files.length > 8) {
      return jsonError("Upload up to 8 photos at a time");
    }

    const dir = path.join(process.cwd(), "public", "uploads", "resorts");
    await mkdir(dir, { recursive: true });

    const urls: string[] = [];
    for (const file of files) {
      if (!ALLOWED.has(file.type)) {
        return jsonError("Only JPG, PNG, WEBP, or GIF images are allowed");
      }
      if (file.size > MAX_BYTES) {
        return jsonError("Each photo must be under 5MB");
      }
      const ext =
        file.type === "image/png"
          ? "png"
          : file.type === "image/webp"
            ? "webp"
            : file.type === "image/gif"
              ? "gif"
              : "jpg";
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(dir, name), buffer);
      urls.push(`/uploads/resorts/${name}`);
    }

    return jsonOk({ urls });
  } catch (error) {
    return handleRouteError(error);
  }
}
