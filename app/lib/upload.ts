import "server-only";
import { randomUUID } from "crypto";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";

// Dozvoljeni video formati -> ekstenzija (ekstenzija se izvodi iz MIME tipa,
// nikada iz korisničkog imena fajla — zaštita od path traversal / lažnih ekstenzija)
const ALLOWED: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/ogg": ".ogv",
  "video/quicktime": ".mov",
};

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "exercises");
const PUBLIC_PREFIX = "/uploads/exercises";

export class UploadError extends Error {}

/**
 * Sačuva video fajl na disk i vrati javnu putanju (npr. /uploads/exercises/uuid.mp4)
 * koja se čuva u bazi. Baca UploadError za nevažeći tip ili preveliku veličinu.
 */
export async function saveVideoFile(file: File): Promise<string> {
  const ext = ALLOWED[file.type];
  if (!ext) {
    throw new UploadError(
      "Nedozvoljen format videa. Dozvoljeni su MP4, WebM, OGG i MOV.",
    );
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError("Video je prevelik (maksimalno 50 MB).");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const fileName = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, fileName), buffer);

  return `${PUBLIC_PREFIX}/${fileName}`;
}

/**
 * Obriše prethodno sačuvani video sa diska (best-effort, ignoriše greške).
 */
export async function deleteVideoFile(publicPath: string | null | undefined) {
  if (!publicPath || !publicPath.startsWith(PUBLIC_PREFIX)) return;
  const fileName = path.basename(publicPath);
  try {
    await unlink(path.join(UPLOAD_DIR, fileName));
  } catch {
    // fajl već ne postoji — ignoriši
  }
}
