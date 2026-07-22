import { ok, fail, assertMethod } from "../utils/api-response.js";
import { numberEnv } from "../utils/env.js";
import { safeEqual } from "../utils/validation.js";
import { getStorageProvider } from "../services/storage/storage-provider.js";

export default async function handler(req, res) {
  try {
    if (!assertMethod(req, res, ["GET"])) return;
    const configuredSecret = process.env.CRON_SECRET;
    const providedSecret = req.headers["x-cron-secret"] || req.query?.secret || "";
    if (!configuredSecret || !safeEqual(providedSecret, configuredSecret)) {
      return fail(res, 401, "UNAUTHORIZED", "Akses cleanup tidak diizinkan.");
    }
    const data = await getStorageProvider().cleanupOlderThan(numberEnv("PHOTO_TTL_MINUTES", 15));
    return ok(res, data, "Cleanup selesai.");
  } catch (error) {
    console.error(error.code || error.message);
    return fail(res, 500, error.code || "CLEANUP_FAILED", "Cleanup belum bisa dijalankan.");
  }
}
