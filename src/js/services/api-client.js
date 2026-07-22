async function parseJson(response) {
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    const message = payload?.error?.message || payload?.message || "Terjadi kesalahan jaringan.";
    throw new Error(message);
  }
  return payload.data;
}

export async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return parseJson(response);
}

export async function getJson(url) {
  return parseJson(await fetch(url, { headers: { Accept: "application/json" } }));
}

export async function postForm(url, formData) {
  return parseJson(await fetch(url, { method: "POST", body: formData }));
}
