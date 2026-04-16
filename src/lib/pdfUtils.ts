"use client";

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { PageItem, PageNumberSettings } from "./types";

export async function buildPdf(
  files: File[],
  pages: PageItem[],
  pageNumberSettings?: PageNumberSettings
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Load all source PDFs
  const sourcePdfs: PDFDocument[] = await Promise.all(
    files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      return PDFDocument.load(arrayBuffer);
    })
  );

  // Copy pages in the current order
  for (const pageItem of pages) {
    const sourcePdf = sourcePdfs[pageItem.sourceFileIndex];
    const [copiedPage] = await pdfDoc.copyPages(sourcePdf, [pageItem.pageIndex]);
    pdfDoc.addPage(copiedPage);
  }

  // Add page numbers if settings provided
  if (pageNumberSettings) {
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const totalPages = pdfDoc.getPageCount();
    const { startPage, endPage, startNumber, position, fontSize } =
      pageNumberSettings;

    const clampedEnd = Math.min(endPage, totalPages);

    for (let i = startPage - 1; i < clampedEnd; i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      const pageNum = startNumber + (i - (startPage - 1));
      const text = String(pageNum);
      const textWidth = font.widthOfTextAtSize(text, fontSize);

      let x: number;
      const y = 20;

      if (position === "bottom-center") {
        x = (width - textWidth) / 2;
      } else if (position === "bottom-right") {
        x = width - textWidth - 20;
      } else {
        x = 20;
      }

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    }
  }

  return pdfDoc.save();
}

export function downloadPdf(pdfBytes: Uint8Array, filename?: string) {
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? generateFilename();
  a.click();
  URL.revokeObjectURL(url);
}

function generateFilename(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = now.getFullYear();
  const mo = pad(now.getMonth() + 1);
  const d = pad(now.getDate());
  const h = pad(now.getHours());
  const mi = pad(now.getMinutes());
  const s = pad(now.getSeconds());
  return `edited_${y}${mo}${d}_${h}${mi}${s}.pdf`;
}
