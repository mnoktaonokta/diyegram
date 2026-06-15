import {
  MOCK_CLIENT_REGISTERED_AT,
  type ClientMealPost,
} from "@/lib/mock/client-data";
import {
  LINKED_PUBLIC_CLIENT_ID,
} from "@/lib/storage/user-profile-storage";
import {
  getAllMockFeedPosts,
  getClientById,
  getClientHistory,
  getClientPostsForDate,
  type ClientProfile,
  type DietitianFeedPost,
} from "@/lib/mock/dietitian-data";
import { loadClientDayRecords } from "@/lib/storage/client-day-storage";
import { getFeedbackForMeal } from "@/lib/storage/meal-interactions-storage";
import { buildCalendarDays } from "@/lib/utils/calendar";
import { sortFeedPostsNewestFirst } from "@/lib/utils/feed-sort";

/** Mock danışan hesabının diyetisyen panelindeki clientId eşlemesi */
export const LINKED_MOCK_CLIENT_ID = "client-1";

function mealSlotKey(mealType: string, isCheat: boolean) {
  return `${mealType}:${isCheat}`;
}

function resolveClientProfile(client: ClientProfile): ClientProfile {
  return client;
}

function patchClientIdentityOnPost(post: DietitianFeedPost): DietitianFeedPost {
  return post;
}

function patchPostsClientIdentity(posts: DietitianFeedPost[]) {
  return posts.map(patchClientIdentityOnPost);
}

export function clientMealToDietitianPost(
  meal: ClientMealPost,
  client: ClientProfile,
): DietitianFeedPost {
  const resolvedClient = resolveClientProfile(client);

  return {
    id: meal.id,
    clientId: resolvedClient.id,
    clientName: resolvedClient.name,
    clientAvatar: resolvedClient.avatarUrl,
    mealType: meal.mealType,
    isCheat: meal.isCheat,
    date: meal.date,
    time: meal.time,
    timeAgo: "yeni",
    images: meal.images,
    note: meal.note,
    feedback: getFeedbackForMeal(meal.id, "PENDING"),
    comments: meal.comments ?? [],
  };
}

function mergePostsForDate(
  mockPosts: DietitianFeedPost[],
  idbPosts: DietitianFeedPost[],
) {
  const idbKeys = new Set(
    idbPosts.map((post) => mealSlotKey(post.mealType, post.isCheat)),
  );

  const remainingMock = mockPosts.filter(
    (post) => !idbKeys.has(mealSlotKey(post.mealType, post.isCheat)),
  );

  return [...remainingMock, ...idbPosts];
}

export async function getMergedClientPostsForDate(
  clientId: string,
  date: string,
): Promise<DietitianFeedPost[]> {
  const mockPosts = getClientPostsForDate(clientId, date);

  if (clientId !== LINKED_MOCK_CLIENT_ID) {
    return patchPostsClientIdentity(mockPosts);
  }

  const records = await loadClientDayRecords();
  const daily = records?.[date];

  if (!daily?.meals.length) {
    return patchPostsClientIdentity(mockPosts);
  }

  const client = getClientById(clientId);
  if (!client) {
    return patchPostsClientIdentity(mockPosts);
  }

  const idbPosts = daily.meals.map((meal) =>
    clientMealToDietitianPost({ ...meal, date }, client),
  );

  return patchPostsClientIdentity(mergePostsForDate(mockPosts, idbPosts));
}

export async function getMergedClientCalendarDays(clientId: string) {
  const client = getClientById(clientId);
  const mockPosts = getClientHistory(clientId);
  const datesWithMeals = new Set(mockPosts.map((post) => post.date));

  if (clientId === LINKED_MOCK_CLIENT_ID) {
    const records = await loadClientDayRecords();
    if (records) {
      for (const [date, record] of Object.entries(records)) {
        if (record.meals.length > 0) {
          datesWithMeals.add(date);
        }
      }
    }
  }

  return buildCalendarDays({
    startDate: client?.registeredAt ?? MOCK_CLIENT_REGISTERED_AT,
    datesWithMeals,
  });
}

export function getLinkedClientDisplayName(fallback = "Danışan") {
  return fallback;
}

export async function getMergedGlobalFeedPosts(): Promise<DietitianFeedPost[]> {
  const byId = new Map(getAllMockFeedPosts().map((post) => [post.id, post]));

  const records = await loadClientDayRecords();
  const client = getClientById(LINKED_MOCK_CLIENT_ID);

  if (records && client) {
    for (const [date, record] of Object.entries(records)) {
      for (const meal of record.meals) {
        const post = clientMealToDietitianPost({ ...meal, date }, client);
        byId.set(post.id, post);
      }
    }
  }

  return sortFeedPostsNewestFirst(patchPostsClientIdentity([...byId.values()]));
}
