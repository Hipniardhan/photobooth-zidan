import { SCREENS } from "../config.js";
import { navigateTo } from "../router.js";
import { getState, setState } from "../state/app-state.js";
import { completePhoto } from "../services/photo-service.js";
import { setButtonLoading } from "../utils/dom.js";
import { validateUserForm } from "../utils/validation.js";

export function renderInputScreen(container) {
  const state = getState();
  container.innerHTML = `
    <div class="panel form-panel">
      <div class="screen-heading">
        <p class="eyebrow">Langkah 5</p>
        <h2>Kirim hasil foto</h2>
      </div>
      <form id="user-form" novalidate>
        <label for="name">Nama</label>
        <input id="name" name="name" autocomplete="name" value="${state.user.name}" />
        <p class="field-error" id="name-error"></p>
        <label for="email">Email</label>
        <input id="email" name="email" type="email" autocomplete="email" value="${state.user.email}" />
        <p class="field-error" id="email-error"></p>
        <div class="actions">
          <button class="button ghost" type="button" id="back-review">Kembali</button>
          <button class="button primary" type="submit" id="submit-photo">Kirim Foto</button>
        </div>
      </form>
    </div>`;

  const form = container.querySelector("#user-form");
  container.querySelector("#back-review").addEventListener("click", () => navigateTo(SCREENS.REVIEW));
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = container.querySelector("#submit-photo");
    const result = validateUserForm({ name: form.name.value, email: form.email.value });
    container.querySelector("#name-error").textContent = result.errors.name || "";
    container.querySelector("#email-error").textContent = result.errors.email || "";
    if (!result.valid) return;

    try {
      setButtonLoading(submit, true, "Mengirim...");
      const data = await completePhoto({
        blob: getState().finalCompositeBlob,
        name: result.values.name,
        email: result.values.email,
        sessionId: getState().sessionId
      });
      setState({
        user: result.values,
        temporaryPhotoUrl: data.publicUrl,
        temporaryPhotoId: data.publicId,
        expiresAt: data.expiresAt,
        emailMode: data.emailMode,
        emailSent: Boolean(data.emailSent),
        partialSuccess: Boolean(data.partialSuccess)
      });
      navigateTo(SCREENS.SUCCESS);
    } catch (error) {
      console.error(error);
      container.querySelector("#email-error").textContent = error.message;
    } finally {
      setButtonLoading(submit, false);
    }
  });
}
