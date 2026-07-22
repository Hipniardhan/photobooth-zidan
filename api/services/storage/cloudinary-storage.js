import { v2 as cloudinary } from "cloudinary";
import { numberEnv, requireEnv } from "../../utils/env.js";

function getCloudinaryHeader(error, headerName) {
  return error?.response?.headers?.[headerName] || error?.http_headers?.[headerName] || error?.headers?.[headerName];
}

export class CloudinaryStorage {
  constructor() {
    requireEnv(["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]);
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
  }

  async upload({ buffer }) {
    const publicId = crypto.randomUUID();
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "photobooth-temp",
          public_id: publicId,
          resource_type: "image",
          overwrite: false
        },
        (error, uploadResult) => {
          if (error) {
            console.error("[Cloudinary Upload Error]", {
              message: error.message,
              httpCode: error.http_code,
              name: error.name,
              xCldError: getCloudinaryHeader(error, "x-cld-error")
            });
            reject(Object.assign(new Error(`Upload Cloudinary gagal: ${error.message}`), { code: "STORAGE_UPLOAD_FAILED", cause: error }));
          }
          else resolve(uploadResult);
        }
      );
      stream.end(buffer);
    });

    if (!result?.secure_url || result.secure_url.startsWith("data:") || result.secure_url.startsWith("blob:")) {
      throw Object.assign(new Error("Cloudinary tidak mengembalikan secure_url yang valid."), { code: "INVALID_STORAGE_URL" });
    }

    return {
      publicUrl: result.secure_url,
      publicId: result.public_id,
      expiresAt: new Date(Date.now() + numberEnv("PHOTO_TTL_MINUTES", 15) * 60 * 1000).toISOString()
    };
  }

  async delete(publicId) {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    return { deleted: result.result === "ok" || result.result === "not found" };
  }

  async cleanupOlderThan() {
    return {
      deleted: 0,
      note: "Cleanup Cloudinary perlu menelusuri aset folder photobooth-temp dan menghapus yang lebih tua dari TTL melalui Admin API atau scheduler eksternal."
    };
  }
}
