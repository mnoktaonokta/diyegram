export function formatFeedTimeAgo(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) {
    return "az önce";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} dk önce`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} saat önce`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} gün önce`;
  }

  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}
