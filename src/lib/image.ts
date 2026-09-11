export async function compressImage(file: File, maxEdge = 1280): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas is not available in this browser.');
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.82);
}

export function parseReceiptText(text: string): { vendor?: string; amount?: number } {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const vendor = lines[0]?.replace(/[^a-zA-Z0-9 &'.,-]/g, '').slice(0, 48);
  const amounts = [...text.matchAll(/\$?\s*(\d{1,5}(?:[.,]\d{2}))/g)]
    .map((match) => Number(match[1]?.replace(',', '.')))
    .filter((n) => Number.isFinite(n) && n > 0 && n < 100000);
  const amount = amounts.length ? Math.max(...amounts) : undefined;
  return { vendor: vendor || undefined, amount };
}
