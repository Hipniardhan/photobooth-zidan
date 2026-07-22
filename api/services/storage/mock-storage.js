import crypto from "node:crypto";
import { numberEnv } from "../../utils/env.js";

const assets = globalThis.__photoboothMockAssets || new Map();
globalThis.__photoboothMockAssets = assets;

export class MockStorage {
  async upload({ buffer, mimeType }) {
    const maxBytes = numberEnv("MAX_UPLOAD_SIZE_MB", 10) * 1024 * 1024;
    if (buffer.length > maxBytes) {
      throw Object.assign(new Error("Ukuran foto melebihi batas."), { code: "FILE_TOO_LARGE" });
    }
    const publicId = `photobooth-temp/${crypto.randomUUID()}`;
    const expiresAt = new Date(Date.now() + numberEnv("PHOTO_TTL_MINUTES", 15) * 60 * 1000).toISOString();
    const publicUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    assets.set(publicId, { publicId, publicUrl, expiresAt, createdAt: Date.now() });
    return { publicUrl, publicId, expiresAt };
  }

  async delete(publicId) {
    return { deleted: assets.delete(publicId) };
  }

  async cleanupOlderThan(ttlMinutes) {
    const cutoff = Date.now() - ttlMinutes * 60 * 1000;
    let deleted = 0;
    for (const [key, value] of assets.entries()) {
      if (value.createdAt < cutoff) {
        assets.delete(key);
        deleted += 1;
      }
    }
    return { deleted };
  }
}
