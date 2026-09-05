import { UserDetails } from "@/lib/types";

export function profileSummary(p: UserDetails): string {
  return [
    `Name: ${[p.firstName, p.lastName].filter(Boolean).join(" ")}`,
    `Title: ${p.jobTitle || "-"} | Experience: ${p.workexperience || "-"}`,
    `Skills: ${(p.skills || []).join(", ")}`,
    `Bio: ${p.bio || "-"}`,
    `Achievements: ${p.achievements || "-"}`,
    (p.experience || [])
      .slice(0, 3)
      .map(
        (e) =>
          `- ${e.title} @ ${e.company} (${e.startDate}–${e.current ? "now" : e.endDate}): ${(e.description || "").slice(0, 160)}`
      )
      .join("\n"),
  ].join("\n");
}
