import type { DietListFileType } from "@/lib/types/client-diet-list";

export type DietListStoredFile = {
  id: string;
  type: DietListFileType;
  url: string;
  fileName: string;
};
