import type { UtilityKind } from "../types";

// Classify utility records when they enter the household model. UI components
// receive the resulting metadata instead of choosing variants from display text.
export function classifyUtility(title: string): UtilityKind | undefined {
  if (
    /\b(electricity|electric)\b|\u0643\u0647\u0631\u0628\u0627\u0621/i.test(
      title,
    )
  )
    return "electricity";
  if (
    /\b(internet|wi-fi|wifi|broadband)\b|\u0625?\u0646\u062a\u0631\u0646\u062a/i.test(
      title,
    )
  )
    return "internet";
  if (/\bwater\b|\u0645\u064a\u0627\u0647|\u0645\u0627\u0621/i.test(title))
    return "water";
  return undefined;
}
