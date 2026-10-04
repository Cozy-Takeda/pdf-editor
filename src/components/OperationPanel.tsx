"use client";

import React from "react";
import type { PageItem, RotationDirection } from "@/lib/types";

interface OperationPanelProps {
  pages: PageItem[];
  files: File[];
  onDeleteSelected: () => void;
  onDeleteOdd: () => void;
  onDeleteEven: () => void;
  onOpenPageNumberModal: () => void;
  onClearAll: () => void;
  onDeselectAll: () => void;
  onRotateSelected: (direction: RotationDirection) => void;
  isProcessing: boolean;
}

export default function OperationPanel({
  pages,
  files,
  onDeleteSelected,
  onDeleteOdd,
  onDeleteEven,
  onOpenPageNumberModal,
  onClearAll,
  onDeselectAll,
  onRotateSelected,
  isProcessing,
}: OperationPanelProps) {
  const selectedCount = pages.filter((p) => p.selected).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        操作パネル
      </h2>

      {/* Selection section — visible only when pages are selected */}
      {selectedCount > 0 && (
        <>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500 font-medium">選択中のページ</p>
            <div className="flex gap-2">
              {([-90, 90] as const).map((direction) => (
                <button
                  key={direction}
                  type="button"
                  disabled={isProcessing}
                  onClick={() => onRotateSelected(direction)}
                  aria-label={`選択した${selectedCount}ページを${direction === -90 ? "左" : "右"}へ90°回転`}
                  className="flex-1 px-2 py-2 text-sm rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {direction === -90 ? "↶ 左へ90°" : "↷ 右へ90°"}
                </button>
              ))}
            </div>
            <button
              onClick={onDeleteSelected}
              className="w-full px-3 py-2 text-sm rounded-lg border border-red-200 text-red-700 hover:bg-red-50 transition-colors text-left"
            >
              選択したページを削除
              <span className="ml-1 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                {selectedCount}
              </span>
            </button>
            <button
              onClick={onDeselectAll}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-left"
            >
              選択を解除
            </button>
          </div>
          <hr className="border-gray-100" />
        </>
      )}

      {/* Delete section */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-500 font-medium">ページ削除</p>
        <button
          onClick={onDeleteOdd}
          disabled={pages.length === 0}
          className="w-full px-3 py-2 text-sm rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-left"
        >
          奇数ページを削除
        </button>
        <button
          onClick={onDeleteEven}
          disabled={pages.length === 0}
          className="w-full px-3 py-2 text-sm rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-left"
        >
          偶数ページを削除
        </button>
      </div>

      <hr className="border-gray-100" />

      {/* Page number section */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-500 font-medium">ページ番号</p>
        <button
          onClick={onOpenPageNumberModal}
          disabled={pages.length === 0}
          className="w-full px-3 py-2 text-sm rounded-lg border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-left"
        >
          ページ番号を追加
        </button>
      </div>

      <hr className="border-gray-100" />

      {/* Clear all */}
      <button
        onClick={onClearAll}
        disabled={pages.length === 0 && files.length === 0}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-left"
      >
        すべてクリア
      </button>
    </div>
  );
}
