export const processImageToPolaroid = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject('Could not get canvas context');
          return;
        }

        // Target Dimensions
        const polaroidWidth = 500;
        const polaroidHeight = 600;
        const innerPadding = 25;
        const bottomPadding = 100; // Classic polaroid bottom

        canvas.width = polaroidWidth;
        canvas.height = polaroidHeight;

        // Draw White Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, polaroidWidth, polaroidHeight);

        // Calculate Image Aspect Ratio for 'Cover' fit
        const drawWidth = polaroidWidth - (innerPadding * 2);
        const drawHeight = polaroidHeight - innerPadding - bottomPadding;
        
        // Draw the image centered and cropped (object-fit: cover equivalent)
        const imgRatio = img.width / img.height;
        const targetRatio = drawWidth / drawHeight;
        
        let renderW, renderH, offsetX, offsetY;

        if (imgRatio > targetRatio) {
          renderH = drawHeight;
          renderW = drawHeight * imgRatio;
          offsetX = innerPadding - (renderW - drawWidth) / 2;
          offsetY = innerPadding;
        } else {
          renderW = drawWidth;
          renderH = drawWidth / imgRatio;
          offsetX = innerPadding;
          offsetY = innerPadding - (renderH - drawHeight) / 2;
        }

        // Clip to the photo area
        ctx.save();
        ctx.beginPath();
        ctx.rect(innerPadding, innerPadding, drawWidth, drawHeight);
        ctx.clip();
        ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
        ctx.restore();

        // Optional: Add a subtle inner shadow or grain could go here, 
        // but simple is better for texture performance.

        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};
