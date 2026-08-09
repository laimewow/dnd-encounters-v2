export const PRIMITIVE_SIZE = 64

/** Extra room around a line's two-point bounding box so its endpoint handles aren't clipped. */
export const LINE_HANDLE_PADDING = 12

/** Radius of a line's draggable endpoint handle, in flow units. */
export const LINE_HANDLE_RADIUS = 6

/** Size of an image/sticker primitive's draggable corner resize handle, in flow units. */
export const RESIZE_HANDLE_SIZE = 12

/** A freshly dropped/pasted image is scaled down (preserving aspect ratio) to fit within this. */
export const IMAGE_DEFAULT_MAX_SIZE = 240

/** Mirrors the domain default in `Scenes.ts` — used here only to center a freshly-dropped sticker under the cursor. */
export const STICKER_DEFAULT_WIDTH = 220
export const STICKER_DEFAULT_HEIGHT = 160

/** A sticker can't be resized smaller than this, so its titlebar/content never get crushed to nothing. */
export const STICKER_MIN_WIDTH = 120
export const STICKER_MIN_HEIGHT = 80
