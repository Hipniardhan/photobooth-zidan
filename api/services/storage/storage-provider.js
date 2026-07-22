import { getEnv } from "../../utils/env.js";
import { MockStorage } from "./mock-storage.js";
import { CloudinaryStorage } from "./cloudinary-storage.js";

export function getStorageProvider() {
  const provider = getEnv("STORAGE_PROVIDER", "mock");
  console.log("[Storage Provider]", provider);
  console.log("[Cloudinary Env]", {
    cloudName: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    apiKey: Boolean(process.env.CLOUDINARY_API_KEY),
    apiSecret: Boolean(process.env.CLOUDINARY_API_SECRET)
  });
  if (provider === "cloudinary") return new CloudinaryStorage();
  if (provider === "mock") return new MockStorage();

  const error = new Error(`Storage provider tidak didukung: ${provider}`);
  error.code = "INVALID_STORAGE_PROVIDER";
  throw error;
}
