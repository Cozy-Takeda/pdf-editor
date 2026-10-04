import type { PageRotation } from "./types";

// Rotation is relative to the source page's displayed orientation.
export function normalizeRotation(angle: number): PageRotation {
  return ((angle % 360 + 360) % 360) as PageRotation;
}
