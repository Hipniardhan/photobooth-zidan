export const SCREENS = {
  FRAME: "SCREEN_FRAME",
  PAYMENT: "SCREEN_PAYMENT",
  CAMERA: "SCREEN_CAMERA",
  REVIEW: "SCREEN_REVIEW",
  INPUT: "SCREEN_INPUT",
  SUCCESS: "SCREEN_SUCCESS"
};

const frameFiles = [
  "Frame1.png",
  "Frame2.png",
  "Frame3.png",
  "Frame4.png",
  "Frame5.png",
  "Frame6.png",
  "Frame7.png",
  "Frame8.png",
  "Frame9.png",
  "Frame10.png"
];

const BASE_FRAME_LAYOUT = {
  width: 683,
  height: 2048,
  slots: [
    { x: 106, y: 104, width: 471, height: 413 },
    { x: 106, y: 524, width: 471, height: 413 },
    { x: 106, y: 944, width: 471, height: 413 },
    { x: 106, y: 1364, width: 471, height: 413 }
  ]
};

const frameSizes = {
  "Frame1.png": { width: 1226, height: 3675 },
  "Frame2.png": { width: 1228, height: 3658 },
  "Frame3.png": { width: 1228, height: 3677 },
  "Frame4.png": { width: 1236, height: 3686 },
  "Frame5.png": { width: 1223, height: 3673 },
  "Frame6.png": { width: 1227, height: 3677 },
  "Frame7.png": { width: 1227, height: 3677 },
  "Frame8.png": { width: 1227, height: 3677 },
  "Frame9.png": { width: 1228, height: 3677 },
  "Frame10.png": { width: 1227, height: 3677 }
};

function fileNameToLabel(fileName) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/([a-z])([0-9])/gi, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function framePath(fileName) {
  return `/frames/${encodeURIComponent(fileName)}`;
}

function scaleSlots(size) {
  const scaleX = size.width / BASE_FRAME_LAYOUT.width;
  const scaleY = size.height / BASE_FRAME_LAYOUT.height;
  return BASE_FRAME_LAYOUT.slots.map((slot) => ({
    x: Math.round(slot.x * scaleX),
    y: Math.round(slot.y * scaleY),
    width: Math.round(slot.width * scaleX),
    height: Math.round(slot.height * scaleY)
  }));
}

export const frames = frameFiles.map((fileName, index) => {
  const path = framePath(fileName);
  const size = frameSizes[fileName];
  return {
    id: `frame-${String(index + 1).padStart(2, "0")}`,
    name: fileNameToLabel(fileName),
    fileName,
    outputWidth: size.width,
    outputHeight: size.height,
    slots: scaleSlots(size),
    thumbnail: path,
    source: path
  };
});

export const PHOTO_PRICE = 15000;
export const QRIS_IMAGE_PATH = "/payment/qris-shopee.png";
export const PHOTO_TTL_MINUTES = 15;
export const FEATURES = {
  emailDelivery: import.meta.env.VITE_ENABLE_EMAIL_DELIVERY === "true"
};
export const SUCCESS_SESSION_DURATION_MINUTES = 15;
export const SUCCESS_SESSION_DURATION_MS = SUCCESS_SESSION_DURATION_MINUTES * 60 * 1000;
