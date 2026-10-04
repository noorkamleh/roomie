export type MemberTone = "purple" | "mint" | "rose";

export function memberTone(name: string): MemberTone {
  const key = name.trim().toLowerCase();
  if (["noor", "نور"].includes(key)) return "purple";
  if (["sara", "sarah", "سارة"].includes(key)) return "mint";
  if (["reem", "ريم"].includes(key)) return "rose";
  let hash = 0;
  for (const character of key)
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return (["purple", "mint", "rose"] as const)[hash % 3];
}
