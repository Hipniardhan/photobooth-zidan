import { Resend } from "resend";
import { getEnv, requireEnv } from "../../utils/env.js";

export async function sendPhotoEmail({ name, email, publicUrl, expiresAt }) {
  const provider = getEnv("EMAIL_PROVIDER", "mock");
  console.log("[Email Provider]", provider);
  console.log("[Resend Env]", {
    apiKey: Boolean(process.env.RESEND_API_KEY),
    emailFrom: Boolean(process.env.EMAIL_FROM)
  });

  if (provider === "mock") {
    console.info("Mock email:", { to: email, name, publicUrl, expiresAt });
    return { emailMode: "mock", emailSent: false };
  }

  if (provider !== "resend") {
    const error = new Error(`Email provider tidak didukung: ${provider}`);
    error.code = "INVALID_EMAIL_PROVIDER";
    throw error;
  }

  requireEnv(["RESEND_API_KEY", "EMAIL_FROM"]);
  const resend = new Resend(process.env.RESEND_API_KEY);
  let result;
  try {
    result = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Foto Photobooth Zidan",
      html: `<p>Halo ${name},</p><p>Terima kasih sudah menggunakan Photobooth Zidan.</p><p>Link sementara foto kamu: <a href="${publicUrl}">${publicUrl}</a></p><p>Link berlaku sampai ${expiresAt}.</p>`
    });
  } catch (error) {
    console.error("[Resend Error]", {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      responseBody: error.response?.data || error.response?.body
    });
    throw Object.assign(new Error("Foto berhasil dibuat, tetapi email gagal dikirim."), {
      code: "EMAIL_FAILED",
      cause: error
    });
  }

  if (result.error) {
    console.error("[Resend Error]", {
      name: result.error.name,
      message: result.error.message,
      statusCode: result.error.statusCode,
      responseBody: result.error
    });
    throw Object.assign(new Error("Foto berhasil dibuat, tetapi email gagal dikirim."), {
      code: "EMAIL_FAILED",
      cause: result.error
    });
  }

  return { emailMode: "resend", emailSent: true, partialSuccess: false, providerResponse: result.data };
}
