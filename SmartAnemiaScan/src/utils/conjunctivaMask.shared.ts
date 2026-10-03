/** A point of the conjunctiva outline, in pixels of the prepared photo. */
export interface MaskPoint {
  x: number;
  y: number;
}

export interface ScanPhoto {
  uri: string;
  width: number;
  height: number;
}

export interface MaskedPhoto {
  uri: string;
  fileName: string;
}

export interface CropWindow {
  x: number;
  y: number;
  width: number;
  height: number;
}

// The training masks are whole portrait frames (3:4) with the conjunctiva covering
// 5–27% of the area. The upload keeps that geometry: a frame cropped tightly around
// the outline would look like nothing the models have seen. Sizes and limits follow
// the image upload contract agreed with the backend (v1.0).
const OUTPUT_ASPECT = 3 / 4;
export const MASK_MAX_WIDTH = 1200;
export const MASK_MIN_WIDTH = 600;
export const MASK_MIN_OPAQUE_FRACTION = 0.02;
export const MASK_MAX_OPAQUE_FRACTION = 0.5;

/**
 * The largest 3:4 portrait window of the photo, centred on the outline as far as the
 * photo edges allow. For a regular 3:4 portrait photo this is the whole photo.
 */
export const getCropWindow = (photo: ScanPhoto, points: MaskPoint[]): CropWindow => {
  const aspect = OUTPUT_ASPECT;
  let width = photo.width;
  let height = width / aspect;
  if (height > photo.height) {
    height = photo.height;
    width = height * aspect;
  }

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
  const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;
  const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);

  return {
    x: clamp(centerX - width / 2, photo.width - width),
    y: clamp(centerY - height / 2, photo.height - height),
    width,
    height,
  };
};

/** Output frame for a crop: 1200×1600 when the photo allows, never upscaled. */
export const getOutputSize = (crop: CropWindow) => {
  const width = Math.min(MASK_MAX_WIDTH, Math.floor(crop.width));
  return { width, height: Math.round(width / OUTPUT_ASPECT) };
};

/** Maps outline points from photo pixels into the output frame. */
export const toOutputPoints = (points: MaskPoint[], crop: CropWindow, outputWidth: number): MaskPoint[] => {
  const scale = outputWidth / crop.width;
  return points.map((p) => ({ x: (p.x - crop.x) * scale, y: (p.y - crop.y) * scale }));
};

const polygonArea = (points: MaskPoint[]) =>
  Math.abs(
    points.reduce((sum, p, i) => {
      const next = points[(i + 1) % points.length];
      return sum + p.x * next.y - next.x * p.y;
    }, 0),
  ) / 2;

/**
 * The same limits the backend enforces with a 400, checked before upload so the
 * user gets the hint right on the outline screen. Returns null when the outline fits.
 */
export const validateOutline = (photo: ScanPhoto, points: MaskPoint[]): string | null => {
  const crop = getCropWindow(photo, points);
  if (crop.width < MASK_MIN_WIDTH) {
    return 'The photo resolution is too low. Please retake it.';
  }

  const fraction = polygonArea(points) / (crop.width * crop.height);
  if (fraction < MASK_MIN_OPAQUE_FRACTION) {
    return 'The outline is too small. Outline the whole conjunctiva, or take the photo closer.';
  }
  if (fraction > MASK_MAX_OPAQUE_FRACTION) {
    return 'The outline is too large. Outline only the pink inner side of the lower eyelid.';
  }
  return null;
};
