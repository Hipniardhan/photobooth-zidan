import { $ } from "../utils/dom.js";

export function showLoading(message = "Memproses...") {
  $("#loading-message").textContent = message;
  $("#loading-overlay").hidden = false;
}

export function hideLoading() {
  $("#loading-overlay").hidden = true;
}
