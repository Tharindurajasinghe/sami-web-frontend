// src/utils/image.js
export function compressImage(file, maxSizeKB = 900) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = e => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const MAX = 800;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        const isPng = file.type === 'image/png';

        if (isPng) {
          // Preserve transparency for background-removed images
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/png'));
        } else {
          // JPEG for photos (smaller file size)
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        }
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}