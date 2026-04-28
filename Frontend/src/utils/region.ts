const MAP: Record<string, string> = {
  bole: "Addis Ababa - East",
  kazanchis: "Addis Ababa - Central",
  piassa: "Addis Ababa - Central",
  merkato: "Addis Ababa - West",
  lideta: "Addis Ababa - West",
  megenagna: "Addis Ababa - North",
  cmc: "Addis Ababa - North-East",
  adama: "Oromia Corridor",
  bishoftu: "Oromia Corridor",
  hawassa: "Southern Corridor",
  "bahir dar": "Northern Corridor",
  mekelle: "Northern Corridor",
  gondar: "Northern Corridor",
};

export function regionFor(location: string): string {
  const k = location.trim().toLowerCase();
  for (const key of Object.keys(MAP)) {
    if (k.includes(key)) return MAP[key];
  }
  return "Unmapped";
}