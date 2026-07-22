import { postForm } from "./api-client.js";

export function completePhoto({ blob, name, email, sessionId }) {
  if (!blob) throw new Error("Hasil akhir foto belum tersedia.");
  const formData = new FormData();
  formData.append("photo", blob, "photobooth-strip.jpg");
  if (name) formData.append("name", name);
  if (email) formData.append("email", email);
  formData.append("sessionId", sessionId);
  return postForm("/api/photo/complete", formData);
}
