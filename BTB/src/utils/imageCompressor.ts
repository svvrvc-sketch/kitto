/**
 * Client-Side Image Compression Utility for Kitto (kitto.uz)
 * Compresses smartphone photos via HTML5 Canvas before persisting to localStorage
 * Prevents QuotaExceededError while preserving book cover clarity.
 */
export async function compressBookImage(
  file: File,
  maxWidth = 800,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Fayl rasm formatida bo\'lishi shart'));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context error'));

        ctx.drawImage(img, 0, 0, width, height);
        // Export as lightweight JPEG (~60-90 KB)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
