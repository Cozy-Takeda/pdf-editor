"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PageItem } from "@/lib/types";

interface PageThumbnailProps {
  page: PageItem;
  index: number;
  fileNames: string[];
  onSelect: (id: string, event: React.MouseEvent) => void;
  onContextMenu: (x: number, y: number) => void;
}

export default function PageThumbnail({
  page,
  index,
  fileNames,
  onSelect,
  onContextMenu,
}: PageThumbnailProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e.clientX, e.clientY);
      }}
      className={`
        relative flex flex-col items-center bg-white rounded-lg border-2 p-2 select-none
        ${isDragging ? "shadow-xl border-blue-400" : "shadow-sm border-gray-200 hover:border-blue-300"}
        ${page.selected ? "border-blue-500 bg-blue-50" : ""}
        w-44
      `}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect(page.id, e);
        }}
        className={`
          absolute top-1 left-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
          ${page.selected ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300 hover:border-blue-400"}
        `}
      >
        {page.selected && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

{/* Drag handle area (covers the thumbnail image) */}
      <div
        className="w-full mt-3 bg-gray-100 rounded overflow-hidden cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
        onClick={(e) => onSelect(page.id, e)}
      >
        {page.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={page.thumbnail}
            alt={`Page ${index + 1}`}
            className="w-full object-contain"
            draggable={false}
          />
        ) : (
          <div className="h-36 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-300 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Page number */}
      <div className="mt-1 text-xs text-gray-600 font-medium">
        p.{index + 1}
      </div>
      {fileNames.length > 1 && (
        <div
          className="text-xs text-gray-400 truncate w-full text-center"
          title={fileNames[page.sourceFileIndex]}
        >
          {fileNames[page.sourceFileIndex]
            ? fileNames[page.sourceFileIndex].replace(".pdf", "")
            : ""}
        </div>
      )}
    </div>
  );
}
