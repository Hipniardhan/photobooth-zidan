import "../css/main.css";
import "../css/components.css";
import { SCREENS } from "./config.js";
import { registerScreen, navigateTo } from "./router.js";
import { resetState, getState } from "./state/app-state.js";
import { revokeObjectUrl } from "./utils/object-url.js";
import { stopCamera } from "./services/camera-service.js";
import { showToast } from "./components/toast.js";
import { renderFrameScreen } from "./screens/frame-screen.js";
import { renderPaymentScreen } from "./screens/payment-screen.js";
import { renderCameraScreen } from "./screens/camera-screen.js";
import { renderReviewScreen } from "./screens/review-screen.js";
import { renderInputScreen } from "./screens/input-screen.js";
import { renderSuccessScreen } from "./screens/success-screen.js";

export function resetApplication() {
  const state = getState();
  state.capturedShots.forEach((shot) => revokeObjectUrl(shot.url));
  revokeObjectUrl(state.finalCompositeUrl);
  stopCamera();
  resetState();
  navigateTo(SCREENS.FRAME);
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/sw.js");
  } catch (error) {
    console.warn("Service worker gagal register", error);
  }
}

registerScreen(SCREENS.FRAME, renderFrameScreen);
registerScreen(SCREENS.PAYMENT, renderPaymentScreen);
registerScreen(SCREENS.CAMERA, renderCameraScreen);
registerScreen(SCREENS.REVIEW, renderReviewScreen);
registerScreen(SCREENS.INPUT, renderInputScreen);
registerScreen(SCREENS.SUCCESS, renderSuccessScreen);

window.addEventListener("error", (event) => {
  console.error(event.error);
  showToast("Terjadi error. Silakan coba lagi.", "error");
});

navigateTo(SCREENS.FRAME);
registerServiceWorker();
