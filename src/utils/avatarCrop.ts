const AVATAR_REFERENCE_SIZE = 140;
const AVATAR_OUTPUT_SIZE = 512;

export async function renderCroppedAvatar(
  imageSrc: string,
  scale: number,
  offsetX: number,
  offsetY: number
): Promise<string> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_OUTPUT_SIZE;
  canvas.height = AVATAR_OUTPUT_SIZE;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Could not create avatar canvas context');
  }

  const coverScale = Math.max(
    AVATAR_OUTPUT_SIZE / image.naturalWidth,
    AVATAR_OUTPUT_SIZE / image.naturalHeight
  );
  const outputScale = coverScale * scale;
  const drawWidth = image.naturalWidth * outputScale;
  const drawHeight = image.naturalHeight * outputScale;
  const offsetScale = AVATAR_OUTPUT_SIZE / AVATAR_REFERENCE_SIZE;
  const x = (AVATAR_OUTPUT_SIZE - drawWidth) / 2 + offsetX * offsetScale;
  const y = (AVATAR_OUTPUT_SIZE - drawHeight) / 2 + offsetY * offsetScale;

  context.clearRect(0, 0, AVATAR_OUTPUT_SIZE, AVATAR_OUTPUT_SIZE);
  context.drawImage(image, x, y, drawWidth, drawHeight);

  return canvas.toDataURL('image/png');
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load avatar image'));
    image.decoding = 'async';
    image.src = src;
  });
}
