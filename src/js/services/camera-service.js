let stream = null;

export async function startCamera(videoElement) {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Browser ini belum mendukung kamera.");
  }
  stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "user",
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    },
    audio: false
  });
  videoElement.srcObject = stream;
  await videoElement.play();
  return stream;
}

export function stopCamera() {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
  stream = null;
}
