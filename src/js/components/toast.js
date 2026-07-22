import { $ } from "../utils/dom.js";

export function showToast(message, type = "info") {
  const root = $("#toast-root");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  root.appendChild(toast);
  window.setTimeout(() => toast.remove(), 4200);
}
