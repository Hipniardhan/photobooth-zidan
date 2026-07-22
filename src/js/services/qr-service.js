import QRCode from "qrcode";

export function isValidPublicPhotoUrl(value) {
  if (!value || typeof value !== "string") return false;
  if (value.startsWith("data:")) return false;
  if (value.startsWith("blob:")) return false;
  if (value.length > 1200) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

export async function renderQrCode(canvas, text) {
  if (!isValidPublicPhotoUrl(text)) {
    throw new Error("QR download tersedia setelah penyimpanan publik diaktifkan.");
  }

  await QRCode.toCanvas(canvas, text, {
    width: 180,
    margin: 1,
    color: {
      dark: "#17333a",
      light: "#ffffff"
    }
  });
}
