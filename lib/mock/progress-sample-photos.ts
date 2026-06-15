import type { ProgressPhoto } from "@/lib/types/client-progress";
import type { GenderOption } from "@/lib/types/user-profile";
import { getProgramDayLabel } from "@/lib/utils/progress-analytics";
import { parseDateKey } from "@/lib/utils/calendar";

export type SampleGender = "male" | "female";

function addDaysToDateKey(dateKey: string, days: number) {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function resolveSampleGender(
  gender: GenderOption | undefined,
): SampleGender {
  if (gender === "female") {
    return "female";
  }

  return "male";
}

export function getSampleProgressPhotos(
  programStartedAt: string,
  gender: SampleGender,
): ProgressPhoto[] {
  const basePath = `/progress-samples/${gender}`;

  return [
    {
      id: `sample-${gender}-1`,
      imageUrl: `${basePath}-1.png`,
      date: programStartedAt,
      label: "1. Gün",
    },
    {
      id: `sample-${gender}-2`,
      imageUrl: `${basePath}-2.png`,
      date: addDaysToDateKey(programStartedAt, 29),
      label: "30. Gün",
    },
    {
      id: `sample-${gender}-3`,
      imageUrl: `${basePath}-3.png`,
      date: addDaysToDateKey(programStartedAt, 59),
      label: "60. Gün",
    },
  ];
}

export function resolveProgressPhotos(
  programStartedAt: string,
  userPhotos: ProgressPhoto[],
  gender: SampleGender,
): ProgressPhoto[] {
  if (userPhotos.length > 0) {
    return userPhotos;
  }

  return getSampleProgressPhotos(programStartedAt, gender);
}

export function getProgressPhotoLabel(
  photo: ProgressPhoto,
  programStartedAt: string,
) {
  if (photo.label) {
    return photo.label;
  }

  return getProgramDayLabel(programStartedAt, photo.date);
}
