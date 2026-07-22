import { FEATURES, SCREENS } from "../config.js";

const steps = [
  [SCREENS.FRAME, "Frame"],
  [SCREENS.PAYMENT, "Bayar"],
  [SCREENS.CAMERA, "Foto"],
  [SCREENS.REVIEW, "Review"],
  ...(FEATURES.emailDelivery ? [[SCREENS.INPUT, "Data"]] : []),
  [SCREENS.SUCCESS, "Selesai"]
];

export function renderProgress(container, currentScreen) {
  const currentIndex = steps.findIndex(([screen]) => screen === currentScreen);
  container.innerHTML = steps
    .map(([screen, label], index) => {
      const status = index < currentIndex ? "done" : index === currentIndex ? "active" : "";
      return `<div class="progress-step ${status}" aria-current="${screen === currentScreen ? "step" : "false"}">
        <span>${index + 1}</span><b>${label}</b>
      </div>`;
    })
    .join("");
}
