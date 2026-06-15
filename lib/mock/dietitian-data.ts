import {
  MEAL_TYPE_LABELS,
  type MeasurementSnapshot,
  type MealTypeKey,
} from "@/lib/mock/client-data";
import type { MealComment } from "@/lib/types/meal-comments";
import { createMealComment } from "@/lib/types/meal-comments";
import { buildCalendarDays, daysAgoKey, monthsAgoKey, todayKey } from "@/lib/utils/calendar";
import { sortFeedPostsNewestFirst } from "@/lib/utils/feed-sort";

export type FeedbackStatus = "LIKED" | "DISLIKED" | "PENDING";

export type DietitianFeedPost = {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  mealType: MealTypeKey;
  isCheat: boolean;
  date: string;
  time?: string;
  timeAgo: string;
  images: string[];
  note?: string;
  feedback: FeedbackStatus;
  comments: MealComment[];
};

export type ClientProfile = {
  id: string;
  name: string;
  avatarUrl: string;
  personalInfoLabel?: string | null;
  measurements: MeasurementSnapshot;
  nextAppointmentDate: string;
  joinedAt: string;
  registeredAt: string;
  lastActivity: string;
};

export const QUICK_COMMENT_TEMPLATES = [
  "Su içmeyi unutma 💧",
  "Porsiyonu küçült",
  "Harika gidiyorsun! 👏",
  "Protein miktarını artır",
  "Akşam karbonhidratı azalt",
] as const;

export const CLIENT_QUICK_COMMENT_TEMPLATES = [
  "Teşekkürler, dikkate alacağım 🙏",
  "Porsiyonu küçülttüm",
  "Bu öğünü bir sonraki sefere iyileştireceğim",
  "Ekstra su içtim bugün 💧",
] as const;

export const MOCK_CLIENTS: ClientProfile[] = [
  {
    id: "client-1",
    name: "Mehmet Demir",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    measurements: {
      start: { weight: 88, fatPercentage: 28.5 },
      previous: { weight: 83.6, fatPercentage: 25.3 },
      current: { weight: 82.4, fatPercentage: 24.8 },
      targetWeight: 78,
      targetFatPercentage: 22,
    },
    nextAppointmentDate: "15 Haziran 2026",
    joinedAt: "3 ay önce",
    registeredAt: monthsAgoKey(3),
    lastActivity: "2 saat önce",
  },
  {
    id: "client-2",
    name: "Ayşe Kaya",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    measurements: {
      start: { weight: 74.5, fatPercentage: 32.0 },
      previous: { weight: 69.8, fatPercentage: 29.2 },
      current: { weight: 68.2, fatPercentage: 28.1 },
      targetWeight: 62,
      targetFatPercentage: 24,
    },
    nextAppointmentDate: "18 Haziran 2026",
    joinedAt: "5 ay önce",
    registeredAt: monthsAgoKey(5),
    lastActivity: "3 saat önce",
  },
  {
    id: "client-3",
    name: "Can Yıldız",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    measurements: {
      start: { weight: 98.0, fatPercentage: 26.8 },
      previous: { weight: 93.2, fatPercentage: 23.9 },
      current: { weight: 91.5, fatPercentage: 22.3 },
      targetWeight: 85,
      targetFatPercentage: 18,
    },
    nextAppointmentDate: "20 Haziran 2026",
    joinedAt: "2 ay önce",
    registeredAt: monthsAgoKey(2),
    lastActivity: "5 saat önce",
  },
  {
    id: "client-4",
    name: "Elif Arslan",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    measurements: {
      start: { weight: 80.2, fatPercentage: 31.4 },
      previous: { weight: 76.1, fatPercentage: 28.0 },
      current: { weight: 74.0, fatPercentage: 26.5 },
      targetWeight: 68,
      targetFatPercentage: 23,
    },
    nextAppointmentDate: "22 Haziran 2026",
    joinedAt: "4 ay önce",
    registeredAt: monthsAgoKey(4),
    lastActivity: "Bugün paylaşmadı",
  },
];

export const MOCK_FEED_POSTS: DietitianFeedPost[] = [
  {
    id: "feed-1",
    clientId: "client-1",
    clientName: "Mehmet Demir",
    clientAvatar: MOCK_CLIENTS[0]!.avatarUrl,
    mealType: "BREAKFAST",
    isCheat: false,
    date: todayKey(),
    time: "08:15",
    timeAgo: "2 saat önce",
    images: [
      "https://images.unsplash.com/photo-1533089860890-a1c582864a1?w=600&h=450&fit=crop",
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&h=450&fit=crop",
    ],
    note: "Yulaf, muz ve badem sütü",
    feedback: "PENDING",
    comments: [],
  },
  {
    id: "feed-2",
    clientId: "client-2",
    clientName: "Ayşe Kaya",
    clientAvatar: MOCK_CLIENTS[1]!.avatarUrl,
    mealType: "LUNCH",
    isCheat: false,
    date: todayKey(),
    time: "12:30",
    timeAgo: "3 saat önce",
    images: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=450&fit=crop",
    ],
    note: "Izgara somon ve yeşillik",
    feedback: "LIKED",
    comments: [
      createMealComment("Harika gidiyorsun! 👏", "DIETITIAN", "Diyetisyen", {
        minutesAgo: 120,
      }),
      createMealComment("Teşekkürler, devam edeceğim!", "CLIENT", "Ayşe Kaya", {
        minutesAgo: 90,
      }),
    ],
  },
  {
    id: "feed-3",
    clientId: "client-3",
    clientName: "Can Yıldız",
    clientAvatar: MOCK_CLIENTS[2]!.avatarUrl,
    mealType: "SNACK_1",
    isCheat: true,
    date: todayKey(),
    time: "14:20",
    timeAgo: "4 saat önce",
    images: [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=450&fit=crop",
    ],
    note: "Arkadaşlarla burger... özür dilerim 🍔",
    feedback: "PENDING",
    comments: [],
  },
  {
    id: "feed-4",
    clientId: "client-4",
    clientName: "Elif Arslan",
    clientAvatar: MOCK_CLIENTS[3]!.avatarUrl,
    mealType: "SNACK_1",
    isCheat: false,
    date: todayKey(),
    time: "16:00",
    timeAgo: "5 saat önce",
    images: [
      "https://images.unsplash.com/photo-1606312619070-d48cbd4abf09?w=600&h=450&fit=crop",
    ],
    note: "Elma ve badem",
    feedback: "PENDING",
    comments: [],
  },
  {
    id: "feed-5",
    clientId: "client-1",
    clientName: "Mehmet Demir",
    clientAvatar: MOCK_CLIENTS[0]!.avatarUrl,
    mealType: "DINNER",
    isCheat: false,
    date: daysAgoKey(1),
    time: "19:30",
    timeAgo: "dün",
    images: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=450&fit=crop",
    ],
    note: "Sebzeli sote ve yoğurt",
    feedback: "DISLIKED",
    comments: [
      createMealComment("Porsiyonu küçült", "DIETITIAN", "Diyetisyen"),
    ],
  },
  {
    id: "feed-6",
    clientId: "client-2",
    clientName: "Ayşe Kaya",
    clientAvatar: MOCK_CLIENTS[1]!.avatarUrl,
    mealType: "BREAKFAST",
    isCheat: false,
    date: daysAgoKey(1),
    time: "08:45",
    timeAgo: "dün",
    images: [
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=450&fit=crop",
    ],
    note: "Avokado toast",
    feedback: "LIKED",
    comments: [],
  },
];

export const MOCK_CLIENT_HISTORY: Record<string, DietitianFeedPost[]> = {
  "client-1": [
    {
      id: "h1-1",
      clientId: "client-1",
      clientName: "Mehmet Demir",
      clientAvatar: MOCK_CLIENTS[0]!.avatarUrl,
      mealType: "BREAKFAST",
      isCheat: false,
      date: todayKey(),
      time: "08:15",
      timeAgo: "2 saat önce",
      images: [
        "https://images.unsplash.com/photo-1533089860890-a1c582864a1?w=600&h=450&fit=crop",
        "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&h=450&fit=crop",
      ],
      note: "Yulaf ve muz",
      feedback: "PENDING",
      comments: [],
    },
    {
      id: "h1-2",
      clientId: "client-1",
      clientName: "Mehmet Demir",
      clientAvatar: MOCK_CLIENTS[0]!.avatarUrl,
      mealType: "LUNCH",
      isCheat: false,
      date: todayKey(),
      time: "12:45",
      timeAgo: "5 saat önce",
      images: [
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=450&fit=crop",
      ],
      note: "Tavuk salata",
      feedback: "LIKED",
      comments: [],
    },
    {
      id: "h1-2b",
      clientId: "client-1",
      clientName: "Mehmet Demir",
      clientAvatar: MOCK_CLIENTS[0]!.avatarUrl,
      mealType: "SNACK_1",
      isCheat: false,
      date: todayKey(),
      time: "16:00",
      timeAgo: "bugün",
      images: [
        "https://images.unsplash.com/photo-1606312619070-d48cbd4abf09?w=600&h=450&fit=crop",
      ],
      note: "Elma ve badem",
      feedback: "PENDING",
      comments: [],
    },
    {
      id: "h1-3",
      clientId: "client-1",
      clientName: "Mehmet Demir",
      clientAvatar: MOCK_CLIENTS[0]!.avatarUrl,
    mealType: "SNACK_2",
    isCheat: true,
    date: daysAgoKey(3),
    time: "21:00",
    timeAgo: "3 gün önce",
    images: [
      "https://images.unsplash.com/photo-1572802419224-296b0a5650a9?w=600&h=450&fit=crop",
    ],
    note: "Doğum günü pastası...",
      feedback: "DISLIKED",
      comments: [
        createMealComment("Porsiyonu küçült", "DIETITIAN", "Diyetisyen", {
          minutesAgo: 180,
        }),
      ],
    },
    {
      id: "h1-4",
      clientId: "client-1",
      clientName: "Mehmet Demir",
      clientAvatar: MOCK_CLIENTS[0]!.avatarUrl,
      mealType: "DINNER",
      isCheat: false,
      date: daysAgoKey(1),
      time: "19:30",
      timeAgo: "dün",
      images: [
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=450&fit=crop",
      ],
      note: "Sebzeli sote",
      feedback: "DISLIKED",
      comments: [
        createMealComment(
          "Akşam yemeği çok iyi görünüyor, devam 👍",
          "CLIENT",
          "Mehmet Demir",
          { minutesAgo: 45 },
        ),
      ],
    },
    {
      id: "h1-5",
      clientId: "client-1",
      clientName: "Mehmet Demir",
      clientAvatar: MOCK_CLIENTS[0]!.avatarUrl,
      mealType: "SNACK_1",
      isCheat: false,
      date: daysAgoKey(4),
      time: "15:30",
      timeAgo: "4 gün önce",
      images: [
        "https://images.unsplash.com/photo-1606312619070-d48cbd4abf09?w=600&h=450&fit=crop",
      ],
      note: "Elma",
      feedback: "LIKED",
      comments: [],
    },
    {
      id: "h1-6",
      clientId: "client-1",
      clientName: "Mehmet Demir",
      clientAvatar: MOCK_CLIENTS[0]!.avatarUrl,
      mealType: "BREAKFAST",
      isCheat: false,
      date: daysAgoKey(5),
      time: "07:50",
      timeAgo: "5 gün önce",
      images: [
        "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&h=450&fit=crop",
      ],
      note: "Yumurta ve tam buğday",
      feedback: "LIKED",
      comments: [],
    },
    {
      id: "h1-j11-a",
      clientId: "client-1",
      clientName: "Mehmet Demir",
      clientAvatar: MOCK_CLIENTS[0]!.avatarUrl,
      mealType: "BREAKFAST",
      isCheat: false,
      date: daysAgoKey(2),
      time: "08:10",
      timeAgo: "2 gün önce",
      images: [
        "https://images.unsplash.com/photo-1533089860890-a1c582864a1?w=600&h=450&fit=crop",
      ],
      note: "11 Haziran sabah kaydı",
      feedback: "PENDING",
      comments: [],
    },
    {
      id: "h1-j11-b",
      clientId: "client-1",
      clientName: "Mehmet Demir",
      clientAvatar: MOCK_CLIENTS[0]!.avatarUrl,
      mealType: "LUNCH",
      isCheat: false,
      date: daysAgoKey(2),
      time: "13:20",
      timeAgo: "2 gün önce",
      images: [
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=450&fit=crop",
      ],
      note: "11 Haziran öğle kaydı",
      feedback: "LIKED",
      comments: [],
    },
  ],
  "client-2": [
    {
      id: "h2-1",
      clientId: "client-2",
      clientName: "Ayşe Kaya",
      clientAvatar: MOCK_CLIENTS[1]!.avatarUrl,
      mealType: "LUNCH",
      isCheat: false,
      date: todayKey(),
      time: "13:00",
      timeAgo: "3 saat önce",
      images: [
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=450&fit=crop",
      ],
      note: "Somon salata",
      feedback: "LIKED",
      comments: [],
    },
    {
      id: "h2-2",
      clientId: "client-2",
      clientName: "Ayşe Kaya",
      clientAvatar: MOCK_CLIENTS[1]!.avatarUrl,
      mealType: "BREAKFAST",
      isCheat: false,
      date: daysAgoKey(1),
      time: "08:30",
      timeAgo: "dün",
      images: [
        "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=450&fit=crop",
      ],
      note: "Avokado toast",
      feedback: "LIKED",
      comments: [],
    },
    {
      id: "h2-cheat",
      clientId: "client-2",
      clientName: "Ayşe Kaya",
      clientAvatar: MOCK_CLIENTS[1]!.avatarUrl,
      mealType: "SNACK_2",
      isCheat: true,
      date: daysAgoKey(1),
      time: "22:15",
      timeAgo: "dün",
      images: [
        "https://images.unsplash.com/photo-1572802419224-296b0a5650a9?w=600&h=450&fit=crop",
      ],
      note: "Gece atıştırmalığı... tatlı kriz 🍫",
      feedback: "PENDING",
      comments: [],
    },
  ],
  "client-3": [
    {
      id: "h3-1",
      clientId: "client-3",
      clientName: "Can Yıldız",
      clientAvatar: MOCK_CLIENTS[2]!.avatarUrl,
    mealType: "SNACK_1",
    isCheat: true,
    date: todayKey(),
    time: "14:20",
    timeAgo: "4 saat önce",
    images: [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=450&fit=crop",
    ],
    note: "Burger itirafı",
      feedback: "PENDING",
      comments: [],
    },
  ],
  "client-4": [
    {
      id: "h4-1",
      clientId: "client-4",
      clientName: "Elif Arslan",
      clientAvatar: MOCK_CLIENTS[3]!.avatarUrl,
      mealType: "SNACK_1",
      isCheat: false,
      date: todayKey(),
      time: "16:00",
      timeAgo: "5 saat önce",
      images: [
        "https://images.unsplash.com/photo-1606312619070-d48cbd4abf09?w=600&h=450&fit=crop",
      ],
      note: "Elma ve badem",
      feedback: "PENDING",
      comments: [],
    },
  ],
};

export function getClientById(id: string) {
  return MOCK_CLIENTS.find((client) => client.id === id);
}

export function searchClients(query: string) {
  const normalized = query.trim().toLocaleLowerCase("tr-TR");

  if (!normalized) {
    return [];
  }

  return MOCK_CLIENTS.filter((client) =>
    client.name.toLocaleLowerCase("tr-TR").includes(normalized),
  );
}

export function getClientHistory(clientId: string) {
  return MOCK_CLIENT_HISTORY[clientId] ?? [];
}

export function getClientCalendarDays(clientId: string) {
  const client = getClientById(clientId);
  const posts = getClientHistory(clientId);

  return buildCalendarDays({
    startDate: client?.registeredAt ?? monthsAgoKey(3),
    datesWithMeals: new Set(posts.map((post) => post.date)),
  });
}

/** @deprecated getClientCalendarDays kullanın */
export function getClientWeekDays(clientId: string) {
  return getClientCalendarDays(clientId);
}

export function getClientPostsForDate(clientId: string, date: string) {
  return getClientHistory(clientId).filter((post) => post.date === date);
}

const DAILY_MEAL_ORDER: MealTypeKey[] = [
  "BREAKFAST",
  "LUNCH",
  "SNACK_1",
  "DINNER",
  "SNACK_2",
];

export function groupPostsByMealType(posts: DietitianFeedPost[]) {
  return DAILY_MEAL_ORDER.map((mealType) => ({
    mealType,
    label: MEAL_TYPE_LABELS[mealType],
    posts: posts.filter((post) => post.mealType === mealType),
  }));
}

export function getAllMockFeedPosts() {
  const byId = new Map<string, DietitianFeedPost>();

  for (const posts of Object.values(MOCK_CLIENT_HISTORY)) {
    for (const post of posts) {
      byId.set(post.id, post);
    }
  }

  for (const post of MOCK_FEED_POSTS) {
    byId.set(post.id, post);
  }

  return sortFeedPostsNewestFirst([...byId.values()]);
}

export function getFeedPosts() {
  return getAllMockFeedPosts();
}
