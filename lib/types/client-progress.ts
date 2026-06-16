import type { StaticImageData } from "next/image";

export type ProgressPhoto = {
  id: string;
  /** Uzak veya yüklenmiş fotoğraf URL'si */
  imageUrl?: string;
  /** Yerel örnek görseller için statik import */
  imageSrc?: StaticImageData;
  /** YYYY-MM-DD — fotoğrafın yüklendiği gün */
  date: string;
  /** Örnek fotoğraflar için sabit etiket (ör. "1. Gün", "Bugün") */
  label?: string;
};
