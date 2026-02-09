/**
 * Carrega o logo AIRscan e retorna como data URL PNG para uso em jsPDF.
 */
export function getLogoDataUrl(): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const dpr = 2;
        canvas.width = img.naturalWidth * dpr;
        canvas.height = img.naturalHeight * dpr;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas 2d not available"));
          return;
        }
        ctx.scale(dpr, dpr);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("Failed to load logo"));
    img.src = "/airscan-logo.svg";
  });
}
