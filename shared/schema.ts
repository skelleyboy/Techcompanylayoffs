import { pgTable, text, integer, real, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const layoffRoundSchema = z.object({
  date: z.string(),
  count: z.number(),
  note: z.string().optional(),
});

export type LayoffRound = z.infer<typeof layoffRoundSchema>;

export const layoffs = pgTable("layoffs", {
  id: varchar("id").primaryKey(),
  company: text("company").notNull(),
  logo: text("logo"),
  industry: text("industry").notNull(),
  employeesCut: integer("employees_cut").notNull(),
  totalEmployeesBefore: integer("total_employees_before"),
  percentageCut: real("percentage_cut"),
  trigger: text("trigger").notNull(),
  layoffType: text("layoff_type").notNull(),
  stockImpact: text("stock_impact"),
  description: text("description").notNull(),
  date: text("date").notNull(),
  ceoQuote: text("ceo_quote"),
  sourceUrl: text("source_url"),
  layoffHistory: json("layoff_history").$type<LayoffRound[]>(),
});

export const insertLayoffSchema = createInsertSchema(layoffs).omit({ id: true });
export type InsertLayoff = z.infer<typeof insertLayoffSchema>;
export type Layoff = typeof layoffs.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
