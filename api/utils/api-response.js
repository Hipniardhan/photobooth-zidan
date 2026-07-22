export function setNoStore(res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
}

export function ok(res, data = {}, message = "OK", status = 200) {
  setNoStore(res);
  return res.status(status).json({ success: true, data, message });
}

export function fail(res, status, code, message) {
  setNoStore(res);
  return res.status(status).json({ success: false, error: { code, message } });
}

export function assertMethod(req, res, methods) {
  if (methods.includes(req.method)) return true;
  fail(res, 405, "METHOD_NOT_ALLOWED", "Metode request tidak didukung.");
  return false;
}
