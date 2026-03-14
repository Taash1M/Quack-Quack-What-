import {
  type ProviderConfig,
  type InsertProviderConfig,
  type Evaluation,
  type InsertEvaluation,
  providerConfigs,
  evaluations,
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  getProviderConfig(userId: string): Promise<ProviderConfig | undefined>;
  upsertProviderConfig(userId: string, config: InsertProviderConfig): Promise<ProviderConfig>;
  createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation>;
  getEvaluation(id: string): Promise<Evaluation | undefined>;
  getEvaluations(): Promise<Evaluation[]>;
  getEvaluationsByUser(userId: string): Promise<Evaluation[]>;
}

export class DatabaseStorage implements IStorage {
  async getProviderConfig(userId: string): Promise<ProviderConfig | undefined> {
    const [config] = await db.select().from(providerConfigs).where(eq(providerConfigs.userId, userId)).limit(1);
    return config;
  }

  async upsertProviderConfig(userId: string, config: InsertProviderConfig): Promise<ProviderConfig> {
    const existing = await this.getProviderConfig(userId);
    if (existing) {
      const [updated] = await db
        .update(providerConfigs)
        .set(config)
        .where(eq(providerConfigs.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(providerConfigs).values({ ...config, userId }).returning();
    return created;
  }

  async createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation> {
    const [created] = await db.insert(evaluations).values(evaluation).returning();
    return created;
  }

  async getEvaluation(id: string): Promise<Evaluation | undefined> {
    const [evaluation] = await db.select().from(evaluations).where(eq(evaluations.id, id));
    return evaluation;
  }

  async getEvaluations(): Promise<Evaluation[]> {
    return db.select().from(evaluations).orderBy(desc(evaluations.createdAt)).limit(50);
  }

  async getEvaluationsByUser(userId: string): Promise<Evaluation[]> {
    return db.select().from(evaluations).where(eq(evaluations.userId, userId)).orderBy(desc(evaluations.createdAt)).limit(100);
  }
}

export const storage = new DatabaseStorage();
