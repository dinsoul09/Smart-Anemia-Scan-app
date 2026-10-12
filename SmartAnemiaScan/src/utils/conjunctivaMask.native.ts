import { ClipOp, ImageFormat, Skia } from '@shopify/react-native-skia';
import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import {
  getCropWindow,
  getOutputSize,
  toOutputPoints,
  type MaskPoint,
  type MaskedPhoto,
  type ScanPhoto,
} from './conjunctivaMask.shared';

// Phone photos are 12+ MP; the editor and the mask do not need more than this,
// and a smaller bitmap keeps the Skia surface well within memory limits.
const MAX_EDIT_SIDE = 1600;

/**
 * Bakes EXIF orientation into the pixels and downsizes the photo, so the editor
 * (which shows the image through <Image>) and Skia (which ignores EXIF) see the
 * same pixel grid and the outline lands where the user drew it.
 */
export const prepareScanPhoto = async (uri: string): Promise<ScanPhoto> => {
  const original = await manipulateAsync(uri, [], { format: SaveFormat.JPEG, compress: 1 });
  const largestSide = Math.max(original.width, original.height);

  if (largestSide <= MAX_EDIT_SIDE) {
    return { uri: original.uri, width: original.width, height: original.height };
  }

  const resize = original.width >= original.height ? { width: MAX_EDIT_SIDE } : { height: MAX_EDIT_SIDE };
  const resized = await manipulateAsync(original.uri, [{ resize }], { format: SaveFormat.JPEG, compress: 0.95 });
  return { uri: resized.uri, width: resized.width, height: resized.height };
};

/**
 * Builds the frame the backend models are trained on: the whole portrait frame (up to
 * 1200×1600) as a PNG, the outlined conjunctiva opaque and everything else fully
 * transparent black. Only this masked frame leaves the device.
 */
export const maskConjunctiva = async (photo: ScanPhoto, points: MaskPoint[]): Promise<MaskedPhoto> => {
  const image = Skia.Image.MakeImageFromEncoded(await Skia.Data.fromURI(photo.uri));
  if (!image) {
    throw new Error('Could not decode the scan photo');
  }

  const crop = getCropWindow(photo, points);
  const output = getOutputSize(crop);
  const surface = Skia.Surface.Make(output.width, output.height);
  if (!surface) {
    throw new Error('Could not allocate the mask surface');
  }

  const outline = Skia.Path.Make();
  toOutputPoints(points, crop, output.width).forEach((p, i) => (i === 0 ? outline.moveTo(p.x, p.y) : outline.lineTo(p.x, p.y)));
  outline.close();

  const canvas = surface.getCanvas();
  // Transparent black outside the outline, as in the training masks
  canvas.clear(Skia.Color('transparent'));
  // No anti-aliasing: a soft edge would mix tissue with black, and the models expect a 0/255 mask
  canvas.clipPath(outline, ClipOp.Intersect, false);
  canvas.drawImageRect(
    image,
    Skia.XYWHRect(crop.x, crop.y, crop.width, crop.height),
    Skia.XYWHRect(0, 0, output.width, output.height),
    Skia.Paint(),
  );
  surface.flush();

  const fileName = `conjunctiva-${Date.now()}.png`;
  const uri = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(uri, surface.makeImageSnapshot().encodeToBase64(ImageFormat.PNG, 100), {
    encoding: FileSystem.EncodingType.Base64,
  });

  return { uri, fileName };
};
