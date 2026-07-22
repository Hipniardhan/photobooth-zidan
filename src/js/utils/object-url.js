export function revokeObjectUrl(url) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

export function blobToObjectUrl(blob) {
  return URL.createObjectURL(blob);
}
