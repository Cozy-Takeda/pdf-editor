import type { PageItem } from "./types";

export function getPreviewSize(
  page: Pick<PageItem, "thumbnailWidth" | "thumbnailHeight" | "rotation">,
  shortSide: number
) {
  const scale = shortSide / Math.min(page.thumbnailWidth, page.thumbnailHeight);
  const imageWidth = page.thumbnailWidth * scale;
  const imageHeight = page.thumbnailHeight * scale;
  const sideways = page.rotation === 90 || page.rotation === 270;
  return {
    imageWidth,
    imageHeight,
    width: sideways ? imageHeight : imageWidth,
    height: sideways ? imageWidth : imageHeight,
  };
}
