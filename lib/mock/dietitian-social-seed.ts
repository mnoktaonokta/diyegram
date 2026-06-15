import type {
  DietitianSocialMeta,
  DietitianSocialPost,
} from "@/lib/types/dietitian-social";

export const DEFAULT_DIETITIAN_SOCIAL_META: DietitianSocialMeta = {
  title: "Klinik Beslenme Uzmanı",
  bio: "Sürdürülebilir beslenme danışmanı. Sağlıklı yaşam yolculuğunuzda yanınızdayım.",
};

export const SEED_DIETITIAN_SOCIAL_POSTS: DietitianSocialPost[] = [
  {
    id: "dsp-1",
    imageUrls: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1498837167922-ddd27525cd27?w=600&h=600&fit=crop",
    ],
    title: "Renkli Quinoa Salatası",
    description:
      "Malzemeler: 1 su bardağı quinoa, salatalık, cherry domates, avokado, limon, zeytinyağı.\n\nQuinoayı haşlayın, sebzelerle karıştırın. Limon ve zeytinyağı ile servis edin. #tarif #salata",
    createdAt: "2026-06-10T10:00:00.000Z",
  },
  {
    id: "dsp-2",
    imageUrls: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=600&fit=crop",
    ],
    title: "Küçük Adımlar, Büyük Değişim",
    description:
      "Mükemmel olmak zorunda değilsiniz, tutarlı olmanız yeterli. Her öğün yeni bir başlangıçtır. #motivasyon",
    createdAt: "2026-06-09T14:00:00.000Z",
  },
  {
    id: "dsp-3",
    imageUrls: [
      "https://images.unsplash.com/photo-1498837167922-ddd27525cd27?w=600&h=600&fit=crop",
    ],
    title: "Ayşe'nin 12 Haftalık Yolculuğu",
    description:
      "Ayşe, düzenli öğün takibi ve porsiyon farkındalığı ile 12 haftada hedef kilosuna 4 kg yaklaştı. En büyük kazanımı: sürdürülebilir alışkanlıklar. #basari #motivasyon",
    createdAt: "2026-06-08T09:30:00.000Z",
  },
  {
    id: "dsp-4",
    imageUrls: [
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&h=600&fit=crop",
    ],
    title: "Protein Smoothie Bowl",
    description:
      "Malzemeler: Yunan yoğurdu, yarım muz, çilek, chia tohumu, badem.\n\nTüm malzemeleri blenderdan geçirin, kaseye alın ve üzerine chia serpin. #tarif #kahvalti",
    createdAt: "2026-06-07T08:00:00.000Z",
  },
  {
    id: "dsp-5",
    imageUrls: [
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=600&fit=crop",
    ],
    title: "Bugün de Devam!",
    description:
      "Bir gün kaçamak yaptınız diye süreci bırakmayın. Yarın tabağınıza sebze ekleyerek devam edin. #motivasyon",
    createdAt: "2026-06-06T18:00:00.000Z",
  },
  {
    id: "dsp-6",
    imageUrls: [
      "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&h=600&fit=crop",
    ],
    title: "Mehmet'in Enerji Dönüşümü",
    description:
      "Mehmet, öğün düzenini oturtunca öğleden sonra yaşadığı enerji düşüşünü azalttı ve antrenman performansını artırdı. #basari",
    createdAt: "2026-06-05T11:00:00.000Z",
  },
];
