export async function extractTransparentLogo(src: string): Promise<string> {
  const image = await loadImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Could not create logo canvas context');
  }

  context.drawImage(image, 0, 0);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;
  const visited = new Uint8Array(width * height);
  const stack: number[] = [];

  const pushIfBackground = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const pixelIndex = y * width + x;
    if (visited[pixelIndex]) return;
    if (!isCheckerBackground(data, pixelIndex * 4)) return;
    visited[pixelIndex] = 1;
    stack.push(pixelIndex);
  };

  for (let x = 0; x < width; x += 1) {
    pushIfBackground(x, 0);
    pushIfBackground(x, height - 1);
  }

  for (let y = 0; y < height; y += 1) {
    pushIfBackground(0, y);
    pushIfBackground(width - 1, y);
  }

  while (stack.length > 0) {
    const pixelIndex = stack.pop()!;
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    const dataIndex = pixelIndex * 4;

    data[dataIndex + 3] = 0;

    pushIfBackground(x + 1, y);
    pushIfBackground(x - 1, y);
    pushIfBackground(x, y + 1);
    pushIfBackground(x, y - 1);
  }

  context.putImageData(imageData, 0, 0);

  const bounds = getOpaqueBounds(data, width, height);
  if (!bounds) {
    return canvas.toDataURL('image/png');
  }

  const trimmedCanvas = document.createElement('canvas');
  trimmedCanvas.width = bounds.width;
  trimmedCanvas.height = bounds.height;
  const trimmedContext = trimmedCanvas.getContext('2d');
  if (!trimmedContext) {
    return canvas.toDataURL('image/png');
  }

  trimmedContext.drawImage(
    canvas,
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
    0,
    0,
    bounds.width,
    bounds.height
  );

  return trimmedCanvas.toDataURL('image/png');
}

export async function imageToDataUri(src: string): Promise<string> {
  try {
    const response = await fetch(src);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('FileReader failed'));
      reader.readAsDataURL(blob);
    });
  } catch {
    // Fallback to canvas if fetch fails (though fetch is usually more reliable for local assets)
    const image = await loadImage(src);
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not create image canvas context');
    context.drawImage(image, 0, 0);
    return canvas.toDataURL('image/png');
  }
}

function isCheckerBackground(data: Uint8ClampedArray, index: number): boolean {
  const r = data[index];
  const g = data[index + 1];
  const b = data[index + 2];
  const a = data[index + 3];

  if (a === 0) return false;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const average = (r + g + b) / 3;

  return average > 170 && max - min < 18;
}

function getOpaqueBounds(data: Uint8ClampedArray, width: number, height: number) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha === 0) continue;

      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < minX || maxY < minY) {
    return null;
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous'; // Help with potential CORS issues
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.decoding = 'async';
    image.src = src;
  });
}
