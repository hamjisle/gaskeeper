import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const missionReports = sqliteTable("mission_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  profileId: text("profile_id").notNull(),
  victory: integer("victory", { mode:"boolean" }).notNull(),
  score: integer("score").notNull(),
  timeUsed: integer("time_used").notNull(),
  hp: integer("hp").notNull(),
  seals: integer("seals").notNull(),
  defeated: integer("defeated").notNull(),
  knowledge: integer("knowledge").notNull(),
  rescued: integer("rescued").notNull(),
  scenarioId: text("scenario_id").notNull(),
  difficulty: text("difficulty").notNull(),
  safetyJudgment: integer("safety_judgment").notNull(),
  goldenTime: integer("golden_time").notNull(),
  rescueScore: integer("rescue_score").notNull(),
  knowledgeScore: integer("knowledge_score").notNull(),
  safetyIndex: integer("safety_index").notNull(),
  wrongChoices: integer("wrong_choices").notNull(),
  sparkHits: integer("spark_hits").notNull(),
  gasExposure: integer("gas_exposure").notNull(),
  pulseCount: integer("pulse_count").notNull(),
  lastMistake: text("last_mistake").notNull().default(""),
  coopActions: integer("coop_actions").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const keeperProfiles = sqliteTable("keeper_profiles", {
  profileId: text("profile_id").primaryKey(),
  xp: integer("xp").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  missions: integer("missions").notNull().default(0),
  bestIndex: integer("best_index").notNull().default(0),
  badges: text("badges").notNull().default("[]"),
  sensorLevel: integer("sensor_level").notNull().default(1),
  suitTier: integer("suit_tier").notNull().default(1),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const coopSessions = sqliteTable("coop_sessions", {
  code: text("code").primaryKey(),
  connected: integer("connected", { mode:"boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const coopActions = sqliteTable("coop_actions", {
  id: integer("id").primaryKey({ autoIncrement:true }),
  code: text("code").notNull(),
  action: text("action").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
