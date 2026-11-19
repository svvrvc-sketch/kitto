import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { compressBookImage } from './imageCompressor';

/**
 * Compresses an image file to a lightweight Blob in the browser using HTML5 Canvas.
 */
export async function compressImageToBlob(
  file: File,
  maxWidth = 1000,
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
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

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas toBlob failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Uploads an image file to Supabase Storage ('covers' bucket).
 * If Supabase is configured and reachable, returns the public CDN URL.
 * If offline or Supabase fails, falls back to compressed Base64 DataURL.
 */
export async function uploadImageToStorage(
  file: File,
  folder: 'covers' | 'avatars' = 'covers'
): Promise<string> {
  // If Supabase is configured, try Supabase Storage first
  if (isSupabaseConfigured) {
    try {
      const blob = await compressImageToBlob(file, folder === 'avatars' ? 500 : 1000, 0.82);
      const filename = `${folder}/${folder === 'avatars' ? 'avatar' : 'book'}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;

      const { data, error } = await supabase.storage
        .from('covers')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: true,
          cacheControl: '31536000',
        });

      if (!error && data) {
        const { data: publicData } = supabase.storage
          .from('covers')
          .getPublicUrl(filename);

        if (publicData?.publicUrl) {
          return publicData.publicUrl;
        }
      } else if (error) {
        console.warn('[Storage] Supabase upload failed, falling back to local base64:', error.message);
      }
    } catch (storageErr) {
      console.warn('[Storage] Supabase upload exception, falling back to local base64:', storageErr);
    }
  }

  // Graceful fallback to client-side compressed Base64 data URL
  const maxDim = folder === 'avatars' ? 400 : 800;
  return compressBookImage(file, maxDim, 0.78);
}
