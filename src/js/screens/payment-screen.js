import { PHOTO_PRICE, QRIS_IMAGE_PATH, SCREENS } from "../config.js";
import { navigateTo } from "../router.js";
import { setState } from "../state/app-state.js";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0
});

function formatPrice(amount) {
  return currencyFormatter.format(amount).replace(/\s/g, "");
}

export function renderPaymentScreen(container) {
  const formattedPrice = formatPrice(PHOTO_PRICE);
  container.innerHTML = `
    <div class="panel payment-layout">
      <div class="screen-heading">
        <p class="eyebrow">Langkah 2</p>
        <h2>Pembayaran QRIS</h2>
      </div>

      <div class="manual-payment-note">
        <b>Pembayaran diverifikasi secara manual oleh kasir.</b>
        <span>Aplikasi tidak memeriksa transaksi secara otomatis.</span>
      </div>

      <div class="payment-amount" aria-label="Nominal pembayaran">${formattedPrice}</div>

      <div class="static-qris-box">
        <img id="qris-image" src="${QRIS_IMAGE_PATH}" alt="QRIS Shopee Partner" />
        <div id="qris-placeholder" class="qris-placeholder" hidden>Gambar QRIS belum tersedia</div>
      </div>

      <div class="payment-instructions">
        <p>Silakan scan QRIS dan lakukan pembayaran sebesar ${formattedPrice}.</p>
        <p>Setelah pembayaran berhasil, tunjukkan bukti pembayaran kepada kasir.</p>
      </div>

      <p id="payment-status" class="status-pill" aria-live="polite">Menunggu konfirmasi kasir</p>

      <div class="actions">
        <button class="button ghost" id="change-frame" type="button">Ganti Frame</button>
        <button class="button primary large-action" id="cashier-confirm" type="button">Pembayaran Sudah Dikonfirmasi Kasir</button>
      </div>
    </div>

    <div class="modal-backdrop" id="cashier-modal" hidden>
      <div class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="cashier-modal-title">
        <h3 id="cashier-modal-title">Konfirmasi Kasir</h3>
        <p>Pastikan kasir telah memeriksa dan mengonfirmasi pembayaran sebesar ${formattedPrice}.</p>
        <p>Lanjutkan ke kamera?</p>
        <div class="actions">
          <button class="button ghost" id="cancel-confirm" type="button">Batal</button>
          <button class="button primary" id="continue-camera" type="button">Lanjut ke Kamera</button>
        </div>
      </div>
    </div>`;

  const qrisImage = container.querySelector("#qris-image");
  const qrisPlaceholder = container.querySelector("#qris-placeholder");
  const modal = container.querySelector("#cashier-modal");
  const confirmButton = container.querySelector("#cashier-confirm");
  const continueButton = container.querySelector("#continue-camera");
  const cancelButton = container.querySelector("#cancel-confirm");

  qrisImage.addEventListener("error", () => {
    console.error(`Gambar QRIS gagal dimuat: ${QRIS_IMAGE_PATH}`);
    qrisImage.hidden = true;
    qrisPlaceholder.hidden = false;
  });

  container.querySelector("#change-frame").addEventListener("click", () => {
    setState({ paymentStatus: null });
    navigateTo(SCREENS.FRAME);
  });

  confirmButton.addEventListener("click", () => {
    confirmButton.disabled = true;
    modal.hidden = false;
    continueButton.focus();
  });

  cancelButton.addEventListener("click", () => {
    modal.hidden = true;
    confirmButton.disabled = false;
    confirmButton.focus();
  });

  continueButton.addEventListener("click", () => {
    continueButton.disabled = true;
    setState({
      paymentStatus: {
        provider: "static_qris",
        amount: PHOTO_PRICE,
        status: "manually_confirmed",
        confirmedAt: new Date().toISOString()
      },
      capturedShots: [],
      currentShotIndex: 0,
      finalCompositeBlob: null,
      finalCompositeUrl: null
    });
    navigateTo(SCREENS.CAMERA);
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) cancelButton.click();
  });

  return () => {
    modal.hidden = true;
  };
}
