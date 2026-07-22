import { ok, fail, assertMethod } from "../utils/api-response.js";
import { getStorageProvider } from "../services/storage/storage-provider.js";

export default async function handler(req, res) {
  try {
    if (!assertMethod(req, res, ["POST"])) return;
    if (!req.headers["content-type"]?.includes("application/json")) {
      return fail(res, 415, "UNSUPPORTED_CONTENT_TYPE", "Content type harus application/json.");
    }
    const { publicId } = req.body || {};
    if (!publicId || !String(publicId).startsWith("photobooth-temp/")) {
      return fail(res, 400, "INVALID_PUBLIC_ID", "Identifier file sementara belum valid.");
    }
    const data = await getStorageProvider().delete(publicId);
    return ok(res, data, "File sementara diproses untuk dihapus.");
  } catch (error) {
    console.error(error.code || error.message);
    return fail(res, 500, error.code || "STORAGE_DELETE_FAILED", "File sementara belum bisa dihapus.");
  }
}
