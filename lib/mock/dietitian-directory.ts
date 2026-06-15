export type DietitianDirectoryEntry = {
  id: string;
  name: string;
  specialty: string;
};

const BASE_DIETITIANS: DietitianDirectoryEntry[] = [
  {
    id: "dt-1",
    name: "Dr. Ayşe Yılmaz",
    specialty: "Klinik Beslenme",
  },
  {
    id: "dt-2",
    name: "Dr. Mehmet Koç",
    specialty: "Spor Beslenmesi",
  },
  {
    id: "dt-3",
    name: "Uzm. Dyt. Zeynep Aydın",
    specialty: "Çocuk Beslenmesi",
  },
  {
    id: "dt-4",
    name: "Dr. Selin Öztürk",
    specialty: "Diyabet Beslenmesi",
  },
  {
    id: "dt-5",
    name: "Uzm. Dyt. Can Demir",
    specialty: "Klinik Beslenme",
  },
];

export function getDietitianDirectory(): DietitianDirectoryEntry[] {
  return BASE_DIETITIANS;
}

export function searchDietitians(query: string): DietitianDirectoryEntry[] {
  const normalized = query.trim().toLocaleLowerCase("tr");
  const directory = getDietitianDirectory();

  if (!normalized) {
    return directory;
  }

  return directory.filter((entry) => {
    const haystack = `${entry.name} ${entry.specialty}`.toLocaleLowerCase("tr");
    return haystack.includes(normalized);
  });
}
