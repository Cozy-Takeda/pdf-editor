"use client";

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import PageThumbnail from "./PageThumbnail";
import PagePreview from "./PagePreview";
import type { PageItem, RotationDirection } from "@/lib/types";
import { getPreviewSize } from "@/lib/previewUtils";

interface PageGridProps {
  pages: PageItem[];
  fileNames: string[];
  onReorder: (pages: PageItem[]) => void;
  onSelect: (id: string, event: React.MouseEvent) => void;
  onDeselectAll: () => void;
  onRotate: (id: string, direction: RotationDirection) => void;
  isProcessing: boolean;
  shortSide: number;
  files: File[];
}

export default function PageGrid({
  pages,
  fileNames,
  onReorder,
  onSelect,
  onDeselectAll,
  onRotate,
  isProcessing,
  shortSide,
  files,
}: PageGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const selectedCount = pages.filter((p) => p.selected).length;

  const handleContextMenu = (x: number, y: number) => {
    if (selectedCount > 0) setContextMenu({ x, y });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const selectedIds = new Set(pages.filter((p) => p.selected).map((p) => p.id));

    // ドラッグ中のアイテムが選択グループに含まれない場合は単体移動
    if (selectedIds.size <= 1 || !selectedIds.has(activeId)) {
      const oldIndex = pages.findIndex((p) => p.id === activeId);
      const newIndex = pages.findIndex((p) => p.id === overId);
      onReorder(arrayMove(pages, oldIndex, newIndex));
      return;
    }

    // --- 複数選択まとめて移動 ---
    const activeIndex = pages.findIndex((p) => p.id === activeId);
    const overIndex = pages.findIndex((p) => p.id === overId);

    // 選択済み / 非選択 に分ける（元の順序を保持）
    const selectedPages = pages.filter((p) => selectedIds.has(p.id));
    const nonSelectedPages = pages.filter((p) => !selectedIds.has(p.id));

    // 非選択リスト内での挿入位置を決める
    let insertIndex: number;
    if (selectedIds.has(overId)) {
      // ドロップ先も選択済み → overIndex 以前の非選択アイテム数を挿入位置とする
      const pivot = activeIndex < overIndex ? overIndex + 1 : overIndex;
      insertIndex = pages.slice(0, pivot).filter((p) => !selectedIds.has(p.id)).length;
    } else {
      const overInNonSelected = nonSelectedPages.findIndex((p) => p.id === overId);
      // 前→後ろ方向の移動なら over の後ろに、後→前方向なら over の前に挿入
      insertIndex = activeIndex < overIndex ? overInNonSelected + 1 : overInNonSelected;
    }

    const result = [...nonSelectedPages];
    result.splice(insertIndex, 0, ...selectedPages);
    onReorder(result);
  };

  if (pages.length === 0) return null;

  const activePage = activeId ? pages.find((p) => p.id === activeId) : null;
  const activeIndex = activePage ? pages.findIndex((p) => p.id === activeId) : -1;
  const isDraggingGroup =
    activePage?.selected && selectedCount > 1;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={pages.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="overflow-x-auto bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex flex-wrap items-start gap-3 p-4 min-h-[220px]">
            {pages.map((page, index) => (
              <PageThumbnail
                key={page.id}
                page={page}
                index={index}
                fileNames={fileNames}
                onSelect={onSelect}
                onContextMenu={handleContextMenu}
                onRotate={onRotate}
                isProcessing={isProcessing}
                shortSide={shortSide}
                file={files[page.sourceFileIndex]}
              />
            ))}
          </div>
        </div>
      </SortableContext>

      {/* コンテキストメニュー */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              onClick={() => {
                onDeselectAll();
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
            >
              選択を解除
              <span className="ml-1 text-xs text-gray-400">({selectedCount})</span>
            </button>
          </div>
        </>
      )}

      {/* ドラッグ中のオーバーレイ */}
      <DragOverlay>
        {activePage ? (
          <div className="relative opacity-95 rotate-2 shadow-2xl" style={{ width: getPreviewSize(activePage, shortSide).width + 20 }}>
            <div className="bg-white rounded-lg border-2 border-blue-500 p-2 flex flex-col items-center">
              {activePage.thumbnail && (
                <PagePreview
                  page={activePage}
                  shortSide={shortSide}
                  alt={`移動中のページ ${activeIndex + 1}`}
                />
              )}
              <div className="mt-1 text-xs text-gray-600 font-medium">
                p.{activeIndex + 1}
              </div>
            </div>
            {isDraggingGroup && (
              <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
                {selectedCount}
              </div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
