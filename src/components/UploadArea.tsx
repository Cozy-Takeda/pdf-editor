"use client";

import React, { useCallback, useRef, useState } from "react";

interface UploadAreaProps {
  onFilesAdded: (files: File[]) => void;
  isProcessing: boolean;
}

export default function UploadArea({ onFilesAdded, isProcessing }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || isProcessing) return;
      const pdfs = Array.from(fileList).filter(
        (f) => f.type === "application/pdf"
      );
      if (pdfs.length > 0) onFilesAdded(pdfs);
    },
    [onFilesAdded, isProcessing]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      role="button"
      aria-label="PDFファイルを追加"
      aria-disabled={isProcessing}
      tabIndex={isProcessing ? -1 : 0}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => !isProcessing && inputRef.current?.click()}
      onKeyDown={(event) => {
        if (!isProcessing && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      className={`
        border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition-colors shrink-0
        ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"}
        ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        disabled={isProcessing}
        className="hidden"
        onClick={(event) => event.stopPropagation()}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="flex items-center gap-3">
        <svg
          className={`w-7 h-7 shrink-0 ${isDragging ? "text-blue-500" : "text-gray-400"}`}
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
        <div>
          <p className="text-sm font-medium text-gray-700">
            PDFを追加
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            ドロップ、またはクリックして選択（複数可）
          </p>
        </div>
      </div>
    </div>
  );
}
