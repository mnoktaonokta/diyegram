import {
  MOCK_PROGRESS_DAILY_ACTIVITY,
  MOCK_PROGRESS_HISTORY,
} from "@/lib/mock/client-data";
import type { ProgressPhoto } from "@/lib/types/client-progress";

const DEFAULT_PROGRESS_SNAPSHOT = {
  history: MOCK_PROGRESS_HISTORY,
  activity: MOCK_PROGRESS_DAILY_ACTIVITY,
  photos: [] as ProgressPhoto[],
  revision: 0,
};

export function getDefaultProgressSnapshot() {
  return DEFAULT_PROGRESS_SNAPSHOT;
}
