import { getSession } from "@/lib/auth";
import { spacesEnabled, uploadToSpaces, cdnUrl } from "@/lib/spaces";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { randomBytes } from "crypto";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

// Map of allowed formats to file extensions
const FORMAT_TO_EXT: Record<string, string> = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
  gif: "gif",
};

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 8MB" },
        { status: 400 }
      );
    }

    // Read file into buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Use sharp to detect real format and strip metadata
    const image = sharp(buffer, {
      animated: true, // Preserve GIF animations
    });

    const metadata = await image.metadata();
    const detectedFormat = metadata.format?.toLowerCase();

    if (!detectedFormat || !FORMAT_TO_EXT[detectedFormat]) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    // Re-encode to strip metadata and embedded payloads
    const reencoded = await image
      .toFormat(detectedFormat as "jpeg" | "png" | "webp" | "gif")
      .toBuffer();

    // Generate safe filename: timestamp + random + extension
    const ext = FORMAT_TO_EXT[detectedFormat];
    const filename = `${Date.now()}-${randomBytes(9).toString("hex")}.${ext}`;
    const contentType = `image/${detectedFormat === "jpg" ? "jpeg" : detectedFormat}`;

    let url: string;

    if (spacesEnabled()) {
      // Upload to DigitalOcean Spaces
      const spaceKey = `${process.env.DO_SPACES_FOLDER}/uploads/${filename}`;
      await uploadToSpaces(spaceKey, reencoded, contentType);
      url = cdnUrl(spaceKey);
    } else {
      // Local fallback for development without Spaces
      mkdirSync(UPLOAD_DIR, { recursive: true });
      const filepath = join(UPLOAD_DIR, filename);
      writeFileSync(filepath, reencoded);
      url = `/uploads/${filename}`;
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
