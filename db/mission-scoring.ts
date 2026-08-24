import { DIFFICULTIES, SCENARIOS } from "../app/game-data";
import type { Difficulty, ScenarioId } from "../app/game-data";

const DIFFICULTY_KEYS = Object.keys(DIFFICULTIES) as Difficulty[];
const SCENARIO_KEYS = Object.keys(SCENARIOS) as ScenarioId[];

export function sanitizeDifficulty(value: unknown): Difficulty {
  return DIFFICULTY_KEYS.includes(value as Difficulty) ? (value as Difficulty) : "elementary";
}

export function sanitizeScenarioId(value: unknown): ScenarioId {
  return SCENARIO_KEYS.includes(value as ScenarioId) ? (value as ScenarioId) : "kitchen";
}

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function bounded(value: unknown, max: number): number {
  return Math.min(Math.max(0, Math.round(num(value))), max);
}

export type ClampedReport = {
  victory: boolean; score: number; timeUsed: number; hp: number; seals: number; defeated: number;
  knowledge: number; rescued: number; safetyJudgment: number; goldenTime: number; rescueScore: number;
  knowledgeScore: number; safetyIndex: number; wrongChoices: number; sparkHits: number; gasExposure: number;
  pulseCount: number; lastMistake: string; coopActions: number;
};

/**
 * Bounds a client-submitted mission report to what the chosen difficulty could
 * plausibly produce, so a direct API call can't inflate score/xp beyond a
 * normal playthrough. Values inside a normal run pass through unchanged.
 */
export function clampReport(report: Record<string, unknown>, difficulty: Difficulty): ClampedReport {
  const cfg = DIFFICULTIES[difficulty];
  const maxEnemiesDefeated = cfg.enemies + cfg.bossSummons * 4 + 12;
  const maxKillScore = maxEnemiesDefeated * 70 + 650;
  const maxTimeBonus = cfg.time * 3;
  const maxHpBonus = cfg.hp * 2;
  const maxActionScore = 3 * 300 + 150 + 2 * 110 + 3 * 145 + 500;
  const scoreCeiling = maxKillScore + maxTimeBonus + maxHpBonus + maxActionScore;

  return {
    victory: Boolean(report.victory),
    score: bounded(report.score, scoreCeiling),
    timeUsed: bounded(report.timeUsed, cfg.time),
    hp: bounded(report.hp, cfg.hp),
    seals: bounded(report.seals, 3),
    defeated: bounded(report.defeated, maxEnemiesDefeated),
    knowledge: bounded(report.knowledge, 3),
    rescued: bounded(report.rescued, 2),
    safetyJudgment: bounded(report.safetyJudgment, 100),
    goldenTime: bounded(report.goldenTime, 100),
    rescueScore: bounded(report.rescueScore, 100),
    knowledgeScore: bounded(report.knowledgeScore, 100),
    safetyIndex: bounded(report.safetyIndex, 100),
    wrongChoices: Math.max(0, Math.round(num(report.wrongChoices))),
    sparkHits: Math.max(0, Math.round(num(report.sparkHits))),
    gasExposure: Math.max(0, Math.round(num(report.gasExposure))),
    pulseCount: Math.max(0, Math.round(num(report.pulseCount))),
    lastMistake: String(report.lastMistake ?? "").slice(0, 160),
    coopActions: Math.max(0, Math.round(num(report.coopActions))),
  };
}
