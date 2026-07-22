import { SCREENS } from "../config.js";
import { navigateTo } from "../router.js";
import { getState, setState } from "../state/app-state.js";
import { startCamera, stopCamera } from "../services/camera-service.js";
import { captureVideoShot, composeShotsWithFrame } from "../services/canvas-service.js";
import { blobToObjectUrl, revokeObjectUrl } from "../utils/object-url.js";

export function renderCameraScreen(container) {
  let timeoutId = null;
  let cancelled = false;
  let captureRunning = false;
  container.innerHTML = `
    <div class="panel camera-panel">
      <div class="screen-heading">
        <p class="eyebrow">Langkah 3</p>
        <h2 id="shot-title">Foto 1 dari 4</h2>
      </div>
      <div class="camera-frame">
        <video id="camera-video" playsinline muted></video>
        <div id="camera-message" class="camera-message" aria-live="polite">Meminta akses kamera...</div>
        <div id="countdown" class="countdown" aria-live="assertive"></div>
        <img id="shot-preview" class="shot-preview" alt="Preview foto terakhir" hidden />
      </div>
      <div class="actions">
        <button class="button secondary" id="start-countdown" type="button" disabled>Mulai Rangkaian Foto</button>
        <button class="button ghost" id="retry-camera" type="button" hidden>Coba Lagi</button>
      </div>
    </div>`;

  const video = container.querySelector("#camera-video");
  const message = container.querySelector("#camera-message");
  const countdown = container.querySelector("#countdown");
  const title = container.querySelector("#shot-title");
  const shotPreview = container.querySelector("#shot-preview");
  const startButton = container.querySelector("#start-countdown");
  const retryButton = container.querySelector("#retry-camera");

  function wait(ms) {
    return new Promise((resolve) => {
      timeoutId = window.setTimeout(resolve, ms);
    });
  }

  function updateShotTitle() {
    const state = getState();
    title.textContent = `Foto ${state.currentShotIndex + 1} dari ${state.totalShots}`;
  }

  async function bootCamera() {
    try {
      message.textContent = "Meminta akses kamera...";
      retryButton.hidden = true;
      await startCamera(video);
      if (cancelled) return;
      message.textContent = "";
      startButton.disabled = false;
      updateShotTitle();
    } catch (error) {
      console.error(error);
      message.textContent = error.name === "NotAllowedError" ? "Izin kamera ditolak. Berikan akses kamera lalu coba lagi." : error.message || "Kamera tidak ditemukan.";
      retryButton.hidden = false;
    }
  }

  async function captureAfterCountdown() {
    if (captureRunning) return;
    captureRunning = true;
    startButton.disabled = true;
    try {
      const startingState = getState();
      const freshStart = startingState.currentShotIndex === 0 && startingState.capturedShots.length === 0;
      if (freshStart) revokeObjectUrl(startingState.finalCompositeUrl);
      if (freshStart) setState({ finalCompositeBlob: null, finalCompositeUrl: null });

      while (!cancelled && getState().currentShotIndex < getState().totalShots) {
        updateShotTitle();
        shotPreview.hidden = true;
        message.textContent = "Lihat kamera dan bersiap.";
        await wait(450);
        if (cancelled) return;

        for (const number of [3, 2, 1]) {
          countdown.textContent = number;
          await wait(900);
          if (cancelled) return;
        }
        countdown.textContent = "";

        const blob = await captureVideoShot(video);
        const url = blobToObjectUrl(blob);
        const state = getState();
        setState({
          capturedShots: [...state.capturedShots, { blob, url }],
          currentShotIndex: state.currentShotIndex + 1
        });

        shotPreview.src = url;
        shotPreview.hidden = false;
        message.textContent = `Foto ${state.currentShotIndex + 1} tersimpan.`;
        await wait(1200);
      }

      if (cancelled) return;
      message.textContent = "Menggabungkan empat foto...";
      shotPreview.hidden = true;
      const finalBlob = await composeShotsWithFrame(getState().capturedShots, getState().selectedFrame);
      const finalUrl = blobToObjectUrl(finalBlob);
      setState({ finalCompositeBlob: finalBlob, finalCompositeUrl: finalUrl });
      stopCamera();
      navigateTo(SCREENS.REVIEW);
    } catch (error) {
      console.error(error);
      message.textContent = error.message;
      startButton.disabled = false;
      captureRunning = false;
    }
  }

  startButton.addEventListener("click", captureAfterCountdown);
  retryButton.addEventListener("click", bootCamera);
  bootCamera();

  return () => {
    cancelled = true;
    window.clearTimeout(timeoutId);
    stopCamera();
  };
}
