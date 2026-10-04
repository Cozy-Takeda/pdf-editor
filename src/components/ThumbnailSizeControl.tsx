"use client";

interface ThumbnailSizeControlProps {
  value: number;
  onChange: (value: number) => void;
}

export default function ThumbnailSizeControl({ value, onChange }: ThumbnailSizeControlProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
      <label htmlFor="thumbnail-size" className="text-xs font-medium text-gray-600">
        サムネイルの大きさ
      </label>
      <button
        type="button"
        aria-label="サムネイルを小さくする"
        disabled={value <= 120}
        onClick={() => onChange(Math.max(120, value - 20))}
        className="h-8 w-8 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
      >−</button>
      <input
        id="thumbnail-size"
        type="range"
        min={120}
        max={600}
        step={20}
        value={value}
        aria-valuetext={`${Math.round(value / 200 * 100)}%`}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-28 accent-blue-600 sm:w-40"
      />
      <button
        type="button"
        aria-label="サムネイルを大きくする"
        disabled={value >= 600}
        onClick={() => onChange(Math.min(600, value + 20))}
        className="h-8 w-8 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
      >＋</button>
      <output htmlFor="thumbnail-size" className="w-10 text-right text-xs tabular-nums text-gray-600">
        {Math.round(value / 200 * 100)}%
      </output>
      <button
        type="button"
        onClick={() => onChange(200)}
        className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
      >標準に戻す</button>
    </div>
  );
}
