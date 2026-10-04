"use client";

import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";
import type { PageItem, PageNumberSettings } from "./types";
import { normalizeRotation } from "./rotationUtils";

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
    copiedPage.setRotation(degrees(normalizeRotation(
      copiedPage.getRotation().angle + pageItem.rotation
    )));
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
      // Use the visible page area, including PDFs with an offset crop box.
      const crop = page.getCropBox();
      const media = page.getMediaBox();
      const left = Math.max(crop.x, media.x);
      const bottom = Math.max(crop.y, media.y);
      const width = Math.min(crop.x + crop.width, media.x + media.width) - left;
      const height = Math.min(crop.y + crop.height, media.y + media.height) - bottom;
      const rotation = normalizeRotation(page.getRotation().angle);
      const visibleWidth = rotation === 90 || rotation === 270 ? height : width;
      const pageNum = startNumber + (i - (startPage - 1));
      const text = String(pageNum);
      const textWidth = font.widthOfTextAtSize(text, fontSize);

      let displayX: number;
      const displayY = 20;

      if (position === "bottom-center") {
        displayX = (visibleWidth - textWidth) / 2;
      } else if (position === "bottom-right") {
        displayX = visibleWidth - textWidth - 20;
      } else {
        displayX = 20;
      }

      // Map displayed coordinates back into the source page coordinates.
      let x = displayX;
      let y = displayY;
      if (rotation === 90) {
        x = width - displayY;
        y = displayX;
      } else if (rotation === 180) {
        x = width - displayX;
        y = height - displayY;
      } else if (rotation === 270) {
        x = displayY;
        y = height - displayX;
      }

      page.drawText(text, {
        x: left + x,
        y: bottom + y,
        rotate: degrees(rotation),
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
