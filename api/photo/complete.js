import Busboy from "busboy";
import { ok, fail, assertMethod } from "../utils/api-response.js";
import { numberEnv } from "../utils/env.js";
import { isImageMime, isValidEmail, isValidSessionId, sanitizeName } from "../utils/validation.js";
import { getStorageProvider } from "../services/storage/storage-provider.js";
import { sendPhotoEmail } from "../services/email/resend-service.js";

export const config = {
  api: {
    bodyParser: false
  }
};

function parseMultipart(req, maxBytes) {
  return new Promise((resolve, reject) => {
    const fields = {};
    let file = null;
    let totalBytes = 0;
    const busboy = Busboy({ headers: req.headers, limits: { files: 1, fileSize: maxBytes } });

    busboy.on("field", (name, value) => {
      fields[name] = value;
    });
    busboy.on("file", (name, stream, info) => {
      const chunks = [];
      stream.on("data", (chunk) => {
        totalBytes += chunk.length;
        chunks.push(chunk);
        if (totalBytes > maxBytes) reject(Object.assign(new Error("Ukuran foto melebihi batas."), { code: "FILE_TOO_LARGE" }));
      });
      stream.on("limit", () => reject(Object.assign(new Error("Ukuran foto melebihi batas."), { code: "FILE_TOO_LARGE" })));
      stream.on("end", () => {
        file = { fieldName: name, mimeType: info.mimeType, buffer: Buffer.concat(chunks) };
      });
    });
    busboy.on("error", reject);
    busboy.on("finish", () => resolve({ fields, file }));
    req.pipe(busboy);
  });
}

function isEmailDeliveryEnabled() {
  return process.env.ENABLE_EMAIL_DELIVERY === "true" || process.env.VITE_ENABLE_EMAIL_DELIVERY === "true";
}

export default async function handler(req, res) {
  try {
    if (!assertMethod(req, res, ["POST"])) return;
    if (!req.headers["content-type"]?.includes("multipart/form-data")) {
      return fail(res, 415, "UNSUPPORTED_CONTENT_TYPE", "Content type harus multipart/form-data.");
    }

    const maxBytes = numberEnv("MAX_UPLOAD_SIZE_MB", 10) * 1024 * 1024;
    const { fields, file } = await parseMultipart(req, maxBytes);
    const emailEnabled = isEmailDeliveryEnabled();
    const name = sanitizeName(fields.name);
    const email = String(fields.email || "").trim().toLowerCase();
    const sessionId = fields.sessionId;

    if (emailEnabled && (!name || name.length < 2)) return fail(res, 400, "INVALID_NAME", "Nama wajib diisi minimal 2 karakter.");
    if (emailEnabled && !isValidEmail(email)) return fail(res, 400, "INVALID_EMAIL", "Email belum valid.");
    if (!isValidSessionId(sessionId)) return fail(res, 400, "INVALID_SESSION", "Session ID belum valid.");
    if (!file?.buffer?.length) return fail(res, 400, "PHOTO_REQUIRED", "File foto wajib dikirim.");
    if (!isImageMime(file.mimeType)) return fail(res, 400, "INVALID_PHOTO_TYPE", "File foto harus berupa gambar PNG, JPEG, atau WebP.");

    const storageResult = await getStorageProvider().upload({ buffer: file.buffer, mimeType: file.mimeType });
    if (storageResult.publicUrl?.startsWith("data:") || storageResult.publicUrl?.startsWith("blob:")) {
      return fail(res, 500, "INVALID_PUBLIC_URL", "Storage production harus mengembalikan URL publik yang valid.");
    }

    if (!emailEnabled) {
      return ok(
        res,
        {
          ...storageResult,
          emailEnabled: false,
          emailSent: false
        },
        "Foto berhasil disimpan sementara."
      );
    }

    try {
      const emailResult = await sendPhotoEmail({ name, email, publicUrl: storageResult.publicUrl, expiresAt: storageResult.expiresAt });
      return ok(res, { ...storageResult, emailEnabled: true, emailMode: emailResult.emailMode, emailSent: emailResult.emailSent, partialSuccess: false }, "Foto berhasil diproses.");
    } catch (emailError) {
      if (emailError.code !== "EMAIL_FAILED") throw emailError;
      return ok(
        res,
        {
          ...storageResult,
          emailEnabled: true,
          emailMode: "resend",
          emailSent: false,
          partialSuccess: true
        },
        "Foto berhasil disimpan, tetapi email gagal dikirim."
      );
    }
  } catch (error) {
    console.error(error.code || error.message);
    const status = error.code === "FILE_TOO_LARGE" ? 413 : error.code === "ENV_MISSING" ? 500 : 500;
    return fail(res, status, error.code || "PHOTO_COMPLETE_FAILED", error.message || "Foto belum bisa diproses.");
  }
}
