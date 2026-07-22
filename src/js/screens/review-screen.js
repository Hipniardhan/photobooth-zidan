import { FEATURES, SCREENS } from "../config.js";
import { navigateTo } from "../router.js";
import { getState, setState } from "../state/app-state.js";
import { completePhoto } from "../services/photo-service.js";
import { setButtonLoading } from "../utils/dom.js";
import { revokeObjectUrl } from "../utils/object-url.js";

export function renderReviewScreen(container) {
  const state = getState();
  const remaining = state.maxRetakes - state.retakeCount;
  container.innerHTML = `
    <div class="panel review-panel">
      <div class="screen-heading">
        <p class="eyebrow">Langkah 4</p>
        <h2>Review hasil foto</h2>
        <p class="muted">Kesempatan mengulang rangkaian 4 foto tersisa: ${remaining}</p>
      </div>
      <img class="photo-preview photo-strip-preview" src="${state.finalCompositeUrl}" alt="Hasil photo strip photobooth" />
      <div class="actions">
        <button class="button ghost" id="retake-photo" type="button" ${remaining <= 0 ? "disabled" : ""}>Ulang Foto</button>
        <button class="button primary" id="continue-review" type="button">Lanjutkan</button>
      </div>
    </div>`;

  container.querySelector("#retake-photo").addEventListener("click", () => {
    if (remaining <= 0) return;
    const currentState = getState();
    currentState.capturedShots.forEach((shot) => revokeObjectUrl(shot.url));
    revokeObjectUrl(currentState.finalCompositeUrl);
    setState({
      retakeCount: state.retakeCount + 1,
      capturedShots: [],
      currentShotIndex: 0,
      finalCompositeBlob: null,
      finalCompositeUrl: null
    });
    navigateTo(SCREENS.CAMERA);
  });
  container.querySelector("#continue-review").addEventListener("click", async () => {
    if (FEATURES.emailDelivery) {
      navigateTo(SCREENS.INPUT);
      return;
    }

    const button = container.querySelector("#continue-review");
    try {
      setButtonLoading(button, true, "Mengunggah...");
      const data = await completePhoto({
        blob: getState().finalCompositeBlob,
        sessionId: getState().sessionId
      });
      setState({
        temporaryPhotoUrl: data.publicUrl,
        temporaryPhotoId: data.publicId,
        expiresAt: data.expiresAt,
        emailEnabled: Boolean(data.emailEnabled),
        emailMode: data.emailMode || null,
        emailSent: Boolean(data.emailSent),
        partialSuccess: Boolean(data.partialSuccess)
      });
      navigateTo(SCREENS.SUCCESS);
    } catch (error) {
      console.error(error);
      button.textContent = "Upload gagal, coba lagi";
      button.disabled = false;
    }
  });
}
