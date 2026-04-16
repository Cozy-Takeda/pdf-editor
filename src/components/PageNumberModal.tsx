"use client";

import React, { useState } from "react";
import type { PageNumberSettings } from "@/lib/types";

interface PageNumberModalProps {
  totalPages: number;
  onApply: (settings: PageNumberSettings) => void;
  onClose: () => void;
}

export default function PageNumberModal({
  totalPages,
  onApply,
  onClose,
}: PageNumberModalProps) {
  const [settings, setSettings] = useState<PageNumberSettings>({
    startPage: 1,
    endPage: totalPages,
    startNumber: 1,
    position: "bottom-center",
    fontSize: 10,
  });

  const update = <K extends keyof PageNumberSettings>(
    key: K,
    value: PageNumberSettings[K]
  ) => setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">ページ番号の設定</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Start page */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                開始ページ
              </label>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={settings.startPage}
                onChange={(e) => update("startPage", Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                終了ページ
              </label>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={settings.endPage}
                onChange={(e) => update("endPage", Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Start number */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              開始番号（最初のページに表示する数字）
            </label>
            <input
              type="number"
              min={1}
              value={settings.startNumber}
              onChange={(e) => update("startNumber", Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Position */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              表示位置
            </label>
            <select
              value={settings.position}
              onChange={(e) =>
                update("position", e.target.value as PageNumberSettings["position"])
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="bottom-center">中央下</option>
              <option value="bottom-right">右下</option>
              <option value="bottom-left">左下</option>
            </select>
          </div>

          {/* Font size */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              フォントサイズ（{settings.fontSize}pt）
            </label>
            <input
              type="range"
              min={8}
              max={16}
              step={1}
              value={settings.fontSize}
              onChange={(e) => update("fontSize", Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>8pt</span>
              <span>16pt</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={() => onApply(settings)}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            適用してダウンロード
          </button>
        </div>
      </div>
    </div>
  );
}
