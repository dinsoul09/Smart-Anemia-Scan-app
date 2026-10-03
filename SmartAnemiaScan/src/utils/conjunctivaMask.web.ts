import { Image } from 'react-native';
import {
  getCropWindow,
  getOutputSize,
  toOutputPoints,
  type MaskPoint,
  type MaskedPhoto,
  type ScanPhoto,
} from './conjunctivaMask.shared';

// Browsers apply EXIF orientation both in <img> and in createImageBitmap, so on
// web the editor and the mask already share one pixel grid — only the size is needed.
export const prepareScanPhoto = (uri: string): Promise<ScanPhoto> =>
  new Promise((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ uri, width, height }), reject);
  });

const createCanvas = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2d context unavailable');
  }
  return { canvas, context };
};

/**
 * Builds the frame the backend models are trained on: the whole portrait frame (up to
 * 1200×1600) as a PNG, the outlined conjunctiva opaque and everything else fully
 * transparent black. Only this masked frame leaves the device.
 */
export const maskConjunctiva = async (photo: ScanPhoto, points: MaskPoint[]): Promise<MaskedPhoto> => {
  const bitmap = await createImageBitmap(await (await fetch(photo.uri)).blob());

  // getSize and the decoded bitmap normally agree; rescale anyway so a mismatch cannot shift the outline
  const scaleX = bitmap.width / photo.width;
  const scaleY = bitmap.height / photo.height;
  const bitmapPhoto = { uri: photo.uri, width: bitmap.width, height: bitmap.height };
  const bitmapPoints = points.map((p) => ({ x: p.x * scaleX, y: p.y * scaleY }));

  const crop = getCropWindow(bitmapPhoto, bitmapPoints);
  const { width, height } = getOutputSize(crop);
  const outline = toOutputPoints(bitmapPoints, crop, width);

  const frame = createCanvas(width, height);
  frame.context.drawImage(bitmap, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);
  bitmap.close();

  // Browsers always anti-alias paths, so the outline is drawn into its own canvas
  // and thresholded below into a hard 0/255 mask
  const mask = createCanvas(width, height);
  mask.context.beginPath();
  outline.forEach((p, i) => (i === 0 ? mask.context.moveTo(p.x, p.y) : mask.context.lineTo(p.x, p.y)));
  mask.context.closePath();
  mask.context.fill();

  const pixels = frame.context.getImageData(0, 0, width, height);
  const maskAlpha = mask.context.getImageData(0, 0, width, height).data;
  for (let i = 0; i < pixels.data.length; i += 4) {
    if (maskAlpha[i + 3] < 128) {
      // Transparent black outside the outline, as in the training masks
      pixels.data[i] = 0;
      pixels.data[i + 1] = 0;
      pixels.data[i + 2] = 0;
      pixels.data[i + 3] = 0;
    } else {
      pixels.data[i + 3] = 255;
    }
  }
  frame.context.putImageData(pixels, 0, 0);

  const png: Blob | null = await new Promise((resolve) => frame.canvas.toBlob(resolve, 'image/png'));
  if (!png) {
    throw new Error('Canvas produced no blob');
  }

  return { uri: URL.createObjectURL(png), fileName: `conjunctiva-${Date.now()}.png` };
};
