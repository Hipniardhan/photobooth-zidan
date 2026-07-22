import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

const diagnostics = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKeyEnding: process.env.CLOUDINARY_API_KEY?.slice(-4),
  cloudNameAvailable: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
  apiKeyAvailable: Boolean(process.env.CLOUDINARY_API_KEY),
  apiSecretAvailable: Boolean(process.env.CLOUDINARY_API_SECRET)
};

console.log("[Cloudinary Diagnostic]", diagnostics);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

try {
  const result = await cloudinary.api.ping();
  console.log("[Cloudinary Ping]", {
    success: true,
    status: result.status
  });
} catch (error) {
  console.error("[Cloudinary Ping]", {
    success: false,
    message: error.message,
    httpCode: error.http_code,
    name: error.name,
    xCldError: error.response?.headers?.["x-cld-error"] || error.http_headers?.["x-cld-error"]
  });
  process.exitCode = 1;
}
