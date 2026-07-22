import crypto from "node:crypto";

export function sanitizeName(value = "") {
  return String(value).trim().replace(/\s+/g, " ").replace(/[<>]/g, "");
}

export function isValidEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

export function isValidSessionId(value = "") {
  return /^[a-zA-Z0-9-]{10,80}$/.test(String(value));
}

export function isImageMime(mime = "") {
  return ["image/png", "image/jpeg", "image/webp"].includes(mime);
}

export function safeEqual(a = "", b = "") {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
