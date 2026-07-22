import { SUCCESS_SESSION_DURATION_MS } from "../config.js";
import { getState } from "../state/app-state.js";
import { isValidPublicPhotoUrl, renderQrCode } from "../services/qr-service.js";
import { formatCountdown } from "../utils/format.js";
import { resetApplication } from "../main.js";

let successResetTimeoutId = null;
let successCountdownIntervalId = null;

function clearSuccessSessionTimer() {
  if (successResetTimeoutId) {
    window.clearTimeout(successResetTimeoutId);
    successResetTimeoutId = null;
  }

  if (successCountdownIntervalId) {
    window.clearInterval(successCountdownIntervalId);
    successCountdownIntervalId = null;
  }
}

function startSuccessSessionTimer(countdownElement) {
  clearSuccessSessionTimer();
  const endsAt = Date.now() + SUCCESS_SESSION_DURATION_MS;

  const updateCountdown = () => {
    const remaining = Math.max(0, endsAt - Date.now());
    countdownElement.textContent = formatCountdown(remaining);
  };

  updateCountdown();
  successCountdownIntervalId = window.setInterval(updateCountdown, 1000);
  successResetTimeoutId = window.setTimeout(() => {
    clearSuccessSessionTimer();
    resetApplication();
  }, SUCCESS_SESSION_DURATION_MS);
}

export function renderSuccessScreen(container) {
  const state = getState();
  const localDownloadUrl = state.finalCompositeUrl;
  const publicPhotoUrl = state.temporaryPhotoUrl;

  container.innerHTML = `
    <div class="panel success-panel">
      <div class="screen-heading">
        <p class="eyebrow">Selesai</p>
        <h2>Foto berhasil dibuat</h2>
        <p class="muted">Scan QR untuk membuka atau mengunduh foto.</p>
      </div>
      <div class="success-content">
        <img class="photo-preview photo-strip-preview" src="${state.finalCompositeUrl}" alt="Hasil photo strip final" />
        <div class="success-side">
          <div id="qr-wrap" class="qr-result">
            <canvas id="result-qr" width="180" height="180" aria-label="QR Code link foto"></canvas>
            <p id="qr-message" class="status-text"></p>
          </div>
          <p class="status-text">Sisa waktu: <b id="success-countdown">15:00</b></p>
          <div class="actions vertical">
            <a class="button primary" href="${localDownloadUrl}" download="photobooth-zidan.jpg">Download Foto</a>
            <button class="button ghost" id="finish-session" type="button">Selesai</button>
          </div>
        </div>
      </div>
    </div>`;

  const qrCanvas = container.querySelector("#result-qr");
  const qrMessage = container.querySelector("#qr-message");
  if (isValidPublicPhotoUrl(publicPhotoUrl)) {
    renderQrCode(qrCanvas, publicPhotoUrl).catch((error) => {
      console.error("QR Code gagal dibuat", error);
      qrCanvas.hidden = true;
      qrMessage.textContent = error.message;
    });
  } else {
    qrCanvas.hidden = true;
    qrMessage.textContent = "QR gagal dibuat karena URL foto publik belum valid.";
  }

  container.querySelector("#finish-session").addEventListener("click", () => {
    clearSuccessSessionTimer();
    resetApplication();
  });

  startSuccessSessionTimer(container.querySelector("#success-countdown"));

  return () => {
    clearSuccessSessionTimer();
  };
}
