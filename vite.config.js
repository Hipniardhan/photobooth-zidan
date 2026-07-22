import { defineConfig } from "vite";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const apiRoutes = {
  "/api/photo/complete": "./api/photo/complete.js",
  "/api/storage/delete": "./api/storage/delete.js",
  "/api/cron/cleanup": "./api/cron/cleanup.js"
};

function collectJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("error", reject);
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      resolve(raw ? JSON.parse(raw) : {});
    });
  });
}

function withVercelResponse(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(payload));
  };
  return res;
}

function loadLocalEnv(root) {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;
    const key = trimmed.slice(0, separatorIndex);
    const value = trimmed.slice(separatorIndex + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

export default defineConfig({
  plugins: [
    {
      name: "local-vercel-api",
      configureServer(server) {
        const root = path.dirname(fileURLToPath(import.meta.url));
        loadLocalEnv(root);
        server.middlewares.use(async (req, res, next) => {
          const requestUrl = new URL(req.url, "http://localhost");
          const route = apiRoutes[requestUrl.pathname];
          if (!route) return next();

          try {
            req.query = Object.fromEntries(requestUrl.searchParams.entries());
            if (req.headers["content-type"]?.includes("application/json")) {
              req.body = await collectJson(req);
            }
            const mod = await import(`${pathToFileURL(path.join(root, route)).href}?t=${Date.now()}`);
            await mod.default(req, withVercelResponse(res));
          } catch (error) {
            console.error(error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ success: false, error: { code: "DEV_API_ERROR", message: "Dev API gagal diproses." } }));
          }
        });
      }
    }
  ],
  server: {
    host: "0.0.0.0",
    port: 5173
  },
  preview: {
    host: "0.0.0.0",
    port: 4173
  }
});
