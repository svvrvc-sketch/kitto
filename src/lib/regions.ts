export interface RegionOption {
  id: string;
  name: string;
  shortName: string;
}

export const UZBEKISTAN_REGIONS: RegionOption[] = [
  { id: 'tashkent_city', name: 'Toshkent shahri', shortName: 'Toshkent' },
  { id: 'tashkent_region', name: 'Toshkent viloyati', shortName: 'Toshkent vil.' },
  { id: 'samarkand', name: 'Samarqand viloyati', shortName: 'Samarqand' },
  { id: 'fergana', name: 'Fargʻona viloyati', shortName: 'Fargʻona' },
  { id: 'andijan', name: 'Andijon viloyati', shortName: 'Andijon' },
  { id: 'namangan', name: 'Namangan viloyati', shortName: 'Namangan' },
  { id: 'bukhara', name: 'Buxoro viloyati', shortName: 'Buxoro' },
  { id: 'qashqadaryo', name: 'Qashqadaryo viloyati', shortName: 'Qashqadaryo' },
  { id: 'surxondaryo', name: 'Surxondaryo viloyati', shortName: 'Surxondaryo' },
  { id: 'khorezm', name: 'Xorazm viloyati', shortName: 'Xorazm' },
  { id: 'navoiy', name: 'Navoiy viloyati', shortName: 'Navoiy' },
  { id: 'jizzax', name: 'Jizzax viloyati', shortName: 'Jizzax' },
  { id: 'sirdaryo', name: 'Sirdaryo viloyati', shortName: 'Sirdaryo' },
  { id: 'qoraqalpogiston', name: 'Qoraqalpogʻiston Respublikasi', shortName: 'Qoraqalpogʻiston' },
];

export function normalizeRegionName(raw?: string | null): string {
  if (!raw) return 'Toshkent shahri';
  const trimmed = raw.trim();
  const found = UZBEKISTAN_REGIONS.find(
    (r) =>
      r.name.toLowerCase() === trimmed.toLowerCase() ||
      r.shortName.toLowerCase() === trimmed.toLowerCase() ||
      r.id.toLowerCase() === trimmed.toLowerCase()
  );
  return found ? found.name : trimmed;
}

export function isRegionTashkent(regionName?: string | null): boolean {
  if (!regionName) return true;
  const lower = regionName.toLowerCase();
  return lower.includes('toshkent');
}
