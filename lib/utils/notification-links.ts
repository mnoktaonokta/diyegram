export function buildDietitianClientPostHref(
  clientId: string,
  postId: string,
  date: string,
) {
  return `/dietitian/client/${clientId}?date=${date}&post=${postId}`;
}

export function buildClientPostHref(postId: string, date: string) {
  return `/client?date=${date}&post=${postId}`;
}
