export type ProgressPhoto = {
  id: string;
  imageUrl: string;
  /** YYYY-MM-DD — fotoğrafın yüklendiği gün */
  date: string;
  /** Örnek fotoğraflar için sabit etiket (ör. "1. Gün", "Bugün") */
  label?: string;
};
