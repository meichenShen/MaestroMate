import {
  resolveUnit,
  type CurriculumProgress,
  type LearningUnit,
} from "../../content/curriculum.ts";
export type StudyPhase = "learn" | "try" | "done";
export function studyHash(
  u: LearningUnit,
  journey = false,
  phase: StudyPhase = "learn",
  question = 0,
) {
  const base = journey
    ? "#program/aquarium/learn/" + u.id
    : u.area === "works"
      ? "#play/works/aquarium/" + u.id
      : "#play/lessons/" + u.id;
  return phase === "learn"
    ? base
    : base + "/" + phase + (phase === "try" ? "/" + question : "");
}
export function studyParent(
  u: LearningUnit,
  journey: boolean,
  phase: StudyPhase,
  question: number,
) {
  if (phase === "try")
    return studyHash(
      u,
      journey,
      question ? "try" : "learn",
      Math.max(0, question - 1),
    );
  if (phase === "done")
    return studyHash(u, journey, "try", u.checks.length - 1);
  return journey ? "#program/aquarium/chat" : "#play/" + u.area;
}

export function resetProgramProgress(
  progress: CurriculumProgress,
): CurriculumProgress {
  return Object.fromEntries(
    Object.entries(progress).filter(
      ([id]) => resolveUnit(id)?.area !== "works",
    ),
  );
}
