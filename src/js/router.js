import { SCREENS } from "./config.js";
import { getState, setState } from "./state/app-state.js";
import { $, $$ } from "./utils/dom.js";
import { renderProgress } from "./components/progress-stepper.js";
import { stopCamera } from "./services/camera-service.js";

const screenHooks = new Map();
let cleanupCurrent = null;

export function registerScreen(screenName, render) {
  screenHooks.set(screenName, render);
}

export function navigateTo(screenName) {
  cleanupCurrent?.();
  cleanupCurrent = null;
  if (screenName !== SCREENS.CAMERA) stopCamera();

  setState({ currentScreen: screenName });
  $$(".screen").forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === screenName);
  });
  renderProgress($("#progress-stepper"), screenName);

  const container = $(`[data-screen="${screenName}"]`);
  cleanupCurrent = screenHooks.get(screenName)?.(container, getState()) || null;
}

export function rerenderCurrent() {
  navigateTo(getState().currentScreen);
}
