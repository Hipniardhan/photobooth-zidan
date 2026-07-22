export function getEnv(name, fallback = "") {
  return process.env[name] || fallback;
}

export function requireEnv(names) {
  const missing = names.filter((name) => !process.env[name]);
  if (missing.length) {
    const error = new Error(`Konfigurasi server belum lengkap: ${missing.join(", ")}`);
    error.code = "ENV_MISSING";
    throw error;
  }
}

export function numberEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}
