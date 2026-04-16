export type PageItem = {
  id: string;
  pageIndex: number;
  sourceFileIndex: number;
  thumbnail: string;
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
