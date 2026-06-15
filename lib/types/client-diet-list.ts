export type DietListFileType = "image" | "pdf";

export type DietListFile = {
  id: string;
  type: DietListFileType;
  dataUrl: string;
  fileName: string;
};

export type DietListUpload = {
  id: string;
  uploadedAt: string;
  label: string;
  files: DietListFile[];
};
