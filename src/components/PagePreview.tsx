"use client";

import React, { useState } from "react";
import type { PageRotation } from "@/lib/types";

interface PagePreviewProps {
  thumbnail: string;
  rotation: PageRotation;
  alt: string;
}

export default function PagePreview({ thumbnail, rotation, alt }: PagePreviewProps) {
  const [aspectRatio, setAspectRatio] = useState(1);
  const sideways = rotation === 90 || rotation === 270;

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: sideways ? 1 / aspectRatio : aspectRatio }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbnail}
        alt={alt}
        draggable={false}
        onLoad={(event) => {
          const { naturalWidth, naturalHeight } = event.currentTarget;
          if (naturalHeight > 0) setAspectRatio(naturalWidth / naturalHeight);
        }}
        className="absolute left-1/2 top-1/2 object-contain"
        style={{
          width: sideways ? `${aspectRatio * 100}%` : "100%",
          height: sideways ? `${100 / aspectRatio}%` : "100%",
          maxWidth: "none",
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        }}
      />
    </div>
  );
}
