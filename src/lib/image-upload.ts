const imageMimeByExtension: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
}

export const IMAGE_UPLOAD_TYPES = [
  ...new Set(Object.values(imageMimeByExtension)),
  'image/jpg',
  'image/heic-sequence',
  'image/heif-sequence',
]

export const IMAGE_UPLOAD_ACCEPT = [
  ...IMAGE_UPLOAD_TYPES,
  ...Object.keys(imageMimeByExtension).map((extension) => `.${extension}`),
].join(',')

export function normalizeImageFile(file: File): File {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  const type =
    !file.type || file.type === 'application/octet-stream'
      ? imageMimeByExtension[extension] || file.type
      : file.type === 'image/jpg'
        ? 'image/jpeg'
        : file.type
  return type !== file.type
    ? new File([file], file.name, { type, lastModified: file.lastModified })
    : file
}
