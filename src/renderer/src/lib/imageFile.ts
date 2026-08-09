const EXTENSION_BY_MIME: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/bmp': 'bmp',
}

export const extensionFromMime = (mime: string): string => EXTENSION_BY_MIME[mime] ?? 'png'

/** Reads dimensions straight from the file's bytes via createImageBitmap — unlike an
 *  <img src> object URL, this doesn't need `blob:` allowed in the CSP's img-src. */
export const readImageNaturalSize = async (file: File): Promise<{ width: number; height: number }> => {
    const bitmap = await createImageBitmap(file)
    const size = { width: bitmap.width, height: bitmap.height }
    bitmap.close()
    return size
}

/** Scales down (never up) to fit within `max` on the longer side, preserving aspect ratio. */
export const fitWithinMax = (width: number, height: number, max: number): { width: number; height: number } => {
    if (width <= max && height <= max) return { width, height }
    const scale = width > height ? max / width : max / height
    return { width: Math.round(width * scale), height: Math.round(height * scale) }
}
