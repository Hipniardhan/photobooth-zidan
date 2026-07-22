export function drawImageCover(context, image, destinationX, destinationY, destinationWidth, destinationHeight) {
  const sourceWidth = image.videoWidth || image.naturalWidth || image.width;
  const sourceHeight = image.videoHeight || image.naturalHeight || image.height;
  const scale = Math.max(destinationWidth / sourceWidth, destinationHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const x = destinationX + (destinationWidth - width) / 2;
  const y = destinationY + (destinationHeight - height) / 2;
  context.drawImage(image, x, y, width, height);
}

function canvasToBlob(canvas, type = "image/jpeg", quality = 0.9) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Canvas gagal membuat file foto."));
      else resolve(blob);
    }, type, quality);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => {
      console.error(`Frame gagal dimuat untuk Canvas: ${src}`);
      reject(new Error(`Frame gagal dimuat: ${decodeURIComponent(src.split("/").pop() || src)}`));
    };
    image.src = src;
  });
}

async function blobToDrawable(blob) {
  if ("createImageBitmap" in window) return { image: await createImageBitmap(blob), cleanup: () => {} };
  const url = URL.createObjectURL(blob);
  return {
    image: await loadImage(url),
    cleanup: () => URL.revokeObjectURL(url)
  };
}

export async function captureVideoShot(video) {
  const width = video.videoWidth || 1280;
  const height = video.videoHeight || 720;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  context.save();
  context.translate(width, 0);
  context.scale(-1, 1);
  drawImageCover(context, video, 0, 0, width, height);
  context.restore();

  return canvasToBlob(canvas, "image/jpeg", 0.92);
}

export async function composeShotsWithFrame(shots, frameConfig) {
  if (!Array.isArray(shots) || shots.length !== frameConfig.slots.length) {
    throw new Error("Jumlah foto belum lengkap untuk membuat hasil akhir.");
  }

  const frame = await loadImage(frameConfig.source);
  const canvas = document.createElement("canvas");
  canvas.width = frame.naturalWidth || frameConfig.outputWidth;
  canvas.height = frame.naturalHeight || frameConfig.outputHeight;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (const [index, shot] of shots.entries()) {
    const { image, cleanup } = await blobToDrawable(shot.blob);
    const slot = frameConfig.slots[index];
    drawImageCover(context, image, slot.x, slot.y, slot.width, slot.height);
    image.close?.();
    cleanup();
  }

  context.drawImage(frame, 0, 0, canvas.width, canvas.height);
  return canvasToBlob(canvas, "image/jpeg", 0.92);
}
