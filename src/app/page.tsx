"use client";

import React, { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import UploadArea from "@/components/UploadArea";
import OperationPanel from "@/components/OperationPanel";
import DownloadButton from "@/components/DownloadButton";
import HelpModal from "@/components/HelpModal";
import type { PageItem, AppState, PageNumberSettings, RotationDirection } from "@/lib/types";
import { normalizeRotation } from "@/lib/rotationUtils";

// Dynamically import components that use pdfjs-dist (SSR-incompatible)
const PageGrid = dynamic(() => import("@/components/PageGrid"), { ssr: false });
const PageNumberModal = dynamic(() => import("@/components/PageNumberModal"), {
  ssr: false,
});

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function Home() {
  const [state, setState] = useState<AppState>({
    files: [],
    pages: [],
    isProcessing: false,
  });
  const [showPageNumberModal, setShowPageNumberModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [processingLabel, setProcessingLabel] = useState("");
  const [thumbnailSize, setThumbnailSize] = useState(200);
  const [showOperations, setShowOperations] = useState(false);
  const lastSelectedIndex = useRef<number>(-1);

  const setIsProcessing = (v: boolean) =>
    setState((s) => ({ ...s, isProcessing: v }));

  // --- File upload ---
  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    setIsProcessing(true);
    setProcessingLabel("サムネイルを生成中...");

    const { generateAllThumbnails } = await import("@/lib/thumbnailUtils");

    // Capture the current file count before adding new files
    let baseIndex = 0;
    setState((prev) => {
      baseIndex = prev.files.length;
      return { ...prev, files: [...prev.files, ...newFiles] };
    });

    // Generate thumbnails for each new file
    const allNewPages: PageItem[] = [];

    for (let fi = 0; fi < newFiles.length; fi++) {
      const file = newFiles[fi];
      const { thumbnails, dimensions } = await generateAllThumbnails(
        file,
        (cur, total) => {
          setProcessingLabel(
            `${file.name}: ${cur}/${total}ページ 生成中...`
          );
        }
      );

      for (let pi = 0; pi < thumbnails.length; pi++) {
        allNewPages.push({
          id: makeId(),
          pageIndex: pi,
          sourceFileIndex: baseIndex + fi,
          thumbnail: thumbnails[pi],
          thumbnailWidth: dimensions[pi].width,
          thumbnailHeight: dimensions[pi].height,
          rotation: 0,
          selected: false,
        });
      }
    }

    setState((prev) => ({
      ...prev,
      pages: [...prev.pages, ...allNewPages],
      isProcessing: false,
    }));
    setProcessingLabel("");
  }, []);

  // --- Page operations ---
  const handleRotate = useCallback((id: string, direction: RotationDirection) => {
    setState((s) => s.isProcessing ? s : ({
      ...s,
      pages: s.pages.map((p) => p.id === id
        ? { ...p, rotation: normalizeRotation(p.rotation + direction) }
        : p),
    }));
  }, []);

  const handleRotateSelected = useCallback((direction: RotationDirection) => {
    setState((s) => s.isProcessing ? s : ({
      ...s,
      pages: s.pages.map((p) => p.selected
        ? { ...p, rotation: normalizeRotation(p.rotation + direction) }
        : p),
    }));
  }, []);

  const handleReorder = useCallback((pages: PageItem[]) => {
    setState((s) => ({ ...s, pages }));
  }, []);

  const handleSelect = useCallback(
    (id: string, event: React.MouseEvent) => {
      const shift = event.shiftKey;
      const ctrl = event.ctrlKey || event.metaKey;

      setState((s) => {
        const currentIndex = s.pages.findIndex((p) => p.id === id);

        if (shift && lastSelectedIndex.current !== -1) {
          // 範囲選択：最後に選択した位置から現在まで選択状態にする
          const start = Math.min(lastSelectedIndex.current, currentIndex);
          const end = Math.max(lastSelectedIndex.current, currentIndex);
          return {
            ...s,
            pages: s.pages.map((p, i) => ({
              ...p,
              selected: i >= start && i <= end ? true : p.selected,
            })),
          };
        } else if (ctrl) {
          // Ctrl：他の選択を維持したまま個別トグル
          lastSelectedIndex.current = currentIndex;
          return {
            ...s,
            pages: s.pages.map((p) =>
              p.id === id ? { ...p, selected: !p.selected } : p
            ),
          };
        } else {
          // 通常クリック：そのページのみトグル
          lastSelectedIndex.current = currentIndex;
          return {
            ...s,
            pages: s.pages.map((p) =>
              p.id === id ? { ...p, selected: !p.selected } : p
            ),
          };
        }
      });
    },
    []
  );

  const handleDeleteOne = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      pages: s.pages.filter((p) => p.id !== id),
    }));
  }, []);

  const handleDeleteSelected = useCallback(() => {
    setState((s) => ({
      ...s,
      pages: s.pages.filter((p) => !p.selected),
    }));
  }, []);

  const handleDeleteOdd = useCallback(() => {
    // Delete pages at odd positions (1-indexed: 1, 3, 5 → index 0, 2, 4)
    setState((s) => ({
      ...s,
      pages: s.pages.filter((_, i) => i % 2 !== 0),
    }));
  }, []);

  const handleDeleteEven = useCallback(() => {
    // Delete pages at even positions (1-indexed: 2, 4, 6 → index 1, 3, 5)
    setState((s) => ({
      ...s,
      pages: s.pages.filter((_, i) => i % 2 === 0),
    }));
  }, []);

  const handleDeselectAll = useCallback(() => {
    setState((s) => ({
      ...s,
      pages: s.pages.map((p) => ({ ...p, selected: false })),
    }));
  }, []);

  const handleClearAll = useCallback(() => {
    setState({ files: [], pages: [], isProcessing: false });
  }, []);

  // --- Download ---
  const handleDownload = useCallback(async () => {
    if (state.pages.length === 0) return;
    setIsProcessing(true);
    setProcessingLabel("PDFを生成中...");
    try {
      const { buildPdf, downloadPdf } = await import("@/lib/pdfUtils");
      const pdfBytes = await buildPdf(state.files, state.pages);
      downloadPdf(pdfBytes);
    } finally {
      setIsProcessing(false);
      setProcessingLabel("");
    }
  }, [state.files, state.pages]);

  // --- Page number ---
  const handleApplyPageNumber = useCallback(
    async (settings: PageNumberSettings) => {
      setShowPageNumberModal(false);
      setIsProcessing(true);
      setProcessingLabel("ページ番号を追加中...");
      try {
        const { buildPdf, downloadPdf } = await import("@/lib/pdfUtils");
        const pdfBytes = await buildPdf(state.files, state.pages, settings);
        downloadPdf(pdfBytes);
      } finally {
        setIsProcessing(false);
        setProcessingLabel("");
      }
    },
    [state.files, state.pages]
  );

  const fileNames = state.files.map((f) => f.name);

  return (
    <div className="h-dvh overflow-hidden bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm shrink-0 z-40">
        <div className="px-4 sm:px-6 h-14 flex items-center gap-3">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h1 className="text-lg font-bold text-gray-800">PDF Editor</h1>
          <span className="text-xs text-gray-400 hidden sm:inline">
            ブラウザ完結・データ送信なし
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              aria-controls="operation-sidebar"
              aria-expanded={showOperations}
              onClick={() => setShowOperations((open) => !open)}
              className="md:hidden px-3 py-1.5 text-sm text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              操作
              {state.pages.some((p) => p.selected) && (
                <span className="ml-1">({state.pages.filter((p) => p.selected).length})</span>
              )}
            </button>
            <button
              onClick={() => setShowHelpModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              操作方法
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 min-h-0 w-full p-3 sm:p-4 grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] gap-4">
        {showOperations && (
          <div
            className="fixed inset-x-0 top-14 bottom-0 z-30 bg-black/30 md:hidden"
            onClick={() => setShowOperations(false)}
          />
        )}
        <aside
          id="operation-sidebar"
          aria-label="操作パネル"
          className={`${showOperations ? "flex" : "hidden"} md:flex fixed left-0 top-14 bottom-0 z-40 w-[280px] md:static md:w-auto min-h-0 flex-col bg-white border border-gray-200 md:rounded-xl shadow-sm`}
          onKeyDown={(event) => {
            if (event.key === "Escape") setShowOperations(false);
          }}
        >
          <div className="flex justify-end px-3 pt-2 md:hidden">
            <button
              type="button"
              onClick={() => setShowOperations(false)}
              className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
            >閉じる</button>
          </div>
          <OperationPanel
            pages={state.pages}
            files={state.files}
            onDeleteSelected={() => {
              handleDeleteSelected();
              setShowOperations(false);
            }}
            onDeleteOdd={handleDeleteOdd}
            onDeleteEven={handleDeleteEven}
            onOpenPageNumberModal={() => {
              setShowOperations(false);
              setShowPageNumberModal(true);
            }}
            onClearAll={handleClearAll}
            onDeselectAll={handleDeselectAll}
            onRotateSelected={handleRotateSelected}
            isProcessing={state.isProcessing}
            thumbnailSize={thumbnailSize}
            onThumbnailSizeChange={setThumbnailSize}
          />
          <div className="shrink-0 border-t border-gray-100 p-3">
            <DownloadButton
              onClick={handleDownload}
              isProcessing={state.isProcessing}
              disabled={state.pages.length === 0}
            />
          </div>
        </aside>

        <section aria-label="ページ編集" className="min-h-0 min-w-0 overflow-y-auto overscroll-contain flex flex-col gap-4 [scrollbar-gutter:stable]">
          <UploadArea
            onFilesAdded={handleFilesAdded}
            isProcessing={state.isProcessing}
          />

          {/* File list */}
          {state.files.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-3 shrink-0 flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold text-gray-500">
                読み込み済みファイル
              </p>
              <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                {state.files.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-sm text-blue-800"
                  >
                    <svg
                      className="w-4 h-4 text-blue-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="max-w-[200px] truncate">{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processing indicator */}
          {state.isProcessing && (
            <div className="shrink-0 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
              <svg
                className="animate-spin w-5 h-5 flex-shrink-0"
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
              {processingLabel || "処理中..."}
            </div>
          )}

          {/* Page thumbnails */}
          {state.pages.length > 0 && (
            <div className="shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <p className="text-sm font-semibold text-gray-700">
                  ページ一覧
                  <span className="ml-2 text-gray-400 font-normal">
                    {state.pages.length}ページ
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  ドラッグで並び替え / チェックで選択 / ボタンで回転
                </p>
              </div>
              <PageGrid
                pages={state.pages}
                fileNames={fileNames}
                onReorder={handleReorder}
                onSelect={handleSelect}
                onDeselectAll={handleDeselectAll}
                onRotate={handleRotate}
                isProcessing={state.isProcessing}
                shortSide={thumbnailSize}
                files={state.files}
              />
            </div>
          )}

          {/* Empty state */}
          {state.pages.length === 0 && !state.isProcessing && (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-gray-400">
              <svg
                className="w-16 h-16 mb-4 opacity-30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm">
                PDFをアップロードすると、ここにページが表示されます
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Help modal */}
      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}

      {/* Page number modal */}
      {showPageNumberModal && (
        <PageNumberModal
          totalPages={state.pages.length}
          onApply={handleApplyPageNumber}
          onClose={() => setShowPageNumberModal(false)}
        />
      )}
    </div>
  );
}
