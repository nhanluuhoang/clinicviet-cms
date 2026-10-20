const videoMimeByExtension: Record<string, string> = {
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  m4v: 'video/x-m4v',
  webm: 'video/webm',
  '3gp': 'video/3gpp',
  '3g2': 'video/3gpp2',
}
export const VIDEO_UPLOAD_TYPES = Object.values(videoMimeByExtension)
export const VIDEO_UPLOAD_ACCEPT = [
  ...VIDEO_UPLOAD_TYPES,
  ...Object.keys(videoMimeByExtension).map((extension) => `.${extension}`),
].join(',')
export function normalizeVideoFile(file: File): File {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  const type =
    !file.type || file.type === 'application/octet-stream'
      ? videoMimeByExtension[extension] || file.type
      : file.type
  return type !== file.type
    ? new File([file], file.name, { type, lastModified: file.lastModified })
    : file
}
