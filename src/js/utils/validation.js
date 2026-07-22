export function sanitizeName(value) {
  return value.trim().replace(/\s+/g, " ").replace(/[<>]/g, "");
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateUserForm({ name, email }) {
  const errors = {};
  const cleanName = sanitizeName(name);
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanName) errors.name = "Nama wajib diisi.";
  if (cleanName && cleanName.length < 2) errors.name = "Nama minimal 2 karakter.";
  if (!cleanEmail) errors.email = "Email wajib diisi.";
  if (cleanEmail && !isValidEmail(cleanEmail)) errors.email = "Format email belum valid.";
  return { valid: Object.keys(errors).length === 0, errors, values: { name: cleanName, email: cleanEmail } };
}
