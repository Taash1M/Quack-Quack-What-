import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";
export * from "./models/chat";

export const providerConfigs = pgTable("provider_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  provider: text("provider").notNull(),
  apiKey: text("api_key"),
  model: text("model"),
  targetUri: text("target_uri"),
  region: text("region"),
  projectId: text("project_id"),
  location: text("location"),
  accessKeyId: text("access_key_id"),
  secretAccessKey: text("secret_access_key"),
});

export const evaluations = pgTable("evaluations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  source: text("source").notNull(),
  sourceType: text("source_type").notNull(),
  skillCode: text("skill_code"),
  safetyScore: integer("safety_score").notNull(),
  qualityScore: integer("quality_score").notNull(),
  securityScore: integer("security_score").notNull(),
  overallScore: integer("overall_score").notNull(),
  summary: text("summary").notNull(),
  safetyFindings: json("safety_findings").$type<string[]>().notNull(),
  qualityFindings: json("quality_findings").$type<string[]>().notNull(),
  securityFindings: json("security_findings").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProviderConfigSchema = createInsertSchema(providerConfigs).omit({ id: true });
export type InsertProviderConfig = z.infer<typeof insertProviderConfigSchema>;
export type ProviderConfig = typeof providerConfigs.$inferSelect;

export const insertEvaluationSchema = createInsertSchema(evaluations).omit({ id: true, createdAt: true });
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
export type Evaluation = typeof evaluations.$inferSelect;
