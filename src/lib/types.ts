export type PageRotation = 0 | 90 | 180 | 270;
export type RotationDirection = -90 | 90;

export type PageItem = {
  id: string;
  pageIndex: number;
  sourceFileIndex: number;
  thumbnail: string;
  thumbnailWidth: number;
  thumbnailHeight: number;
  rotation: PageRotation;
  selected: boolean;
};

export type AppState = {
  files: File[];
  pages: PageItem[];
  isProcessing: boolean;
};

export type PageNumberSettings = {
  startPage: number;
  endPage: number;
  startNumber: number;
  position: "bottom-center" | "bottom-right" | "bottom-left";
  fontSize: number;
};
