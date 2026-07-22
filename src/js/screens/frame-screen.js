import { frames, SCREENS } from "../config.js";
import { navigateTo } from "../router.js";
import { getState, setState } from "../state/app-state.js";

export function renderFrameScreen(container) {
  const selected = getState().selectedFrame;
  container.innerHTML = `
    <div class="panel">
      <div class="screen-heading">
        <p class="eyebrow">Langkah 1</p>
        <h2>Pilih frame favorit</h2>
      </div>
      <div class="frame-grid">
        ${frames
          .map(
            (frame) => `<button class="frame-card ${selected?.id === frame.id ? "selected" : ""}" type="button" data-frame-id="${frame.id}">
              <img src="${frame.thumbnail}" alt="Preview ${frame.name}" data-frame-file="${frame.fileName}" />
              <span>${frame.name}</span>
            </button>`
          )
          .join("")}
      </div>
      <div class="actions">
        <button class="button primary" id="continue-frame" type="button" ${selected ? "" : "disabled"}>Lanjut ke Pembayaran</button>
      </div>
    </div>`;

  container.querySelectorAll(".frame-card").forEach((button) => {
    button.addEventListener("click", () => {
      setState({ selectedFrame: frames.find((frame) => frame.id === button.dataset.frameId) });
      renderFrameScreen(container);
    });
  });
  container.querySelectorAll(".frame-card img").forEach((image) => {
    image.addEventListener("error", () => {
      console.error(`Frame gagal dimuat: ${image.dataset.frameFile}`);
      image.alt = `Frame gagal dimuat: ${image.dataset.frameFile}`;
      image.closest(".frame-card")?.classList.add("frame-card-error");
    });
  });
  container.querySelector("#continue-frame").addEventListener("click", () => navigateTo(SCREENS.PAYMENT));
}
