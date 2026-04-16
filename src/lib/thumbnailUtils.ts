"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfjsLib: any = null;

async function getPdfjs() {
  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
  return pdfjsLib;
}

export async function generateThumbnail(
  file: File,
  pageIndex: number,
  scale = 0.75
): Promise<string> {
  const pdfjs = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageIndex + 1);

  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext("2d")!;
  await page.render({ canvasContext: ctx, viewport }).promise;

  return canvas.toDataURL("image/jpeg", 0.7);
}

export async function generateAllThumbnails(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<{ thumbnails: string[]; pageCount: number }> {
  const pdfjs = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;

  const thumbnails: string[] = [];

  for (let i = 0; i < pageCount; i++) {
    const page = await pdf.getPage(i + 1);
    const viewport = page.getViewport({ scale: 0.75 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    thumbnails.push(canvas.toDataURL("image/jpeg", 0.7));

    if (onProgress) onProgress(i + 1, pageCount);
  }

  return { thumbnails, pageCount };
}

export async function getPageCount(file: File): Promise<number> {
  const pdfjs = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  return pdf.numPages;
}
