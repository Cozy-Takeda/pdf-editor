"use client";

import React, { useEffect, useRef, useState } from "react";
import type { PageItem } from "@/lib/types";
import { getPreviewSize } from "@/lib/previewUtils";

interface PagePreviewProps {
  page: PageItem;
  shortSide: number;
  file?: File;
  alt: string;
}

export default function PagePreview({ page, shortSide, file, alt }: PagePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [quality, setQuality] = useState<{ thumbnail: string; shortSide: number } | null>(null);
  const size = getPreviewSize(page, shortSide);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "200px",
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!file || !visible) return;
    const originalShortSide = Math.min(page.thumbnailWidth, page.thumbnailHeight);
    const originalLongSide = Math.max(page.thumbnailWidth, page.thumbnailHeight);
    const requestedPixels = Math.min(
      shortSide * Math.min(window.devicePixelRatio || 1, 2),
      3200 * originalShortSide / originalLongSide
    );
    if (requestedPixels <= Math.max(originalShortSide, quality?.shortSide ?? 0)) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const { generateThumbnail } = await import("@/lib/thumbnailUtils");
        if (cancelled) return;
        const thumbnail = await generateThumbnail(file, page.pageIndex, 0.75 * requestedPixels / originalShortSide);
        if (!cancelled) setQuality({ thumbnail, shortSide: requestedPixels });
      } catch {
        // Keep the original preview usable if a higher-resolution render fails.
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [file, page.pageIndex, page.thumbnailWidth, page.thumbnailHeight, shortSide, visible, quality?.shortSide]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden shrink-0"
      style={{ width: size.width, height: size.height }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={quality?.thumbnail ?? page.thumbnail}
        alt={alt}
        draggable={false}
        className="absolute left-1/2 top-1/2 object-contain"
        style={{
          width: size.imageWidth,
          height: size.imageHeight,
          maxWidth: "none",
          transform: `translate(-50%, -50%) rotate(${page.rotation}deg)`,
        }}
      />
    </div>
  );
}
