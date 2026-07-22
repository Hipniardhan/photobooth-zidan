import { SCREENS } from "../config.js";

export const initialState = {
  currentScreen: SCREENS.FRAME,
  selectedFrame: null,
  sessionId: crypto.randomUUID(),
  paymentStatus: null,
  capturedShots: [],
  currentShotIndex: 0,
  totalShots: 4,
  retakeCount: 0,
  maxRetakes: 2,
  finalCompositeBlob: null,
  finalCompositeUrl: null,
  temporaryPhotoUrl: null,
  temporaryPhotoId: null,
  expiresAt: null,
  emailEnabled: false,
  emailMode: null,
  emailSent: false,
  partialSuccess: false,
  user: {
    name: "",
    email: ""
  }
};

let state = { ...initialState, user: { ...initialState.user } };
const subscribers = new Set();

export function getState() {
  return state;
}

export function setState(partial) {
  state = {
    ...state,
    ...partial,
    user: partial.user ? { ...state.user, ...partial.user } : state.user
  };
  subscribers.forEach((callback) => callback(state));
}

export function resetState() {
  state = {
    ...initialState,
    sessionId: crypto.randomUUID(),
    user: { ...initialState.user }
  };
  subscribers.forEach((callback) => callback(state));
}

export function subscribe(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}
