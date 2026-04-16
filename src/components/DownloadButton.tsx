"use client";

import React from "react";

interface DownloadButtonProps {
  onClick: () => void;
  isProcessing: boolean;
  disabled: boolean;
}

export default function DownloadButton({
  onClick,
  isProcessing,
  disabled,
}: DownloadButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isProcessing}
      className={`
        w-full max-w-sm mx-auto flex items-center justify-center gap-2
        px-6 py-3 rounded-xl text-white font-semibold text-base shadow-lg
        transition-all
        ${
          disabled || isProcessing
            ? "bg-gray-300 cursor-not-allowed shadow-none"
            : "bg-blue-600 hover:bg-blue-700 hover:shadow-xl active:scale-95"
        }
      `}
    >
      {isProcessing ? (
        <>
          <svg
            className="animate-spin w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          処理中...
        </>
      ) : (
        <>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          PDFをダウンロード
        </>
      )}
    </button>
  );
}
