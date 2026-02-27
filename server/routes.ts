import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLayoffSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/layoffs", async (_req, res) => {
    try {
      const layoffs = await storage.getLayoffs();
      res.json(layoffs);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch layoffs" });
    }
  });

  app.get("/api/layoffs/:id", async (req, res) => {
    try {
      const layoff = await storage.getLayoff(req.params.id);
      if (!layoff) return res.status(404).json({ error: "Not found" });
      res.json(layoff);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch layoff" });
    }
  });

  app.post("/api/layoffs", async (req, res) => {
    const parsed = insertLayoffSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    try {
      const layoff = await storage.createLayoff(parsed.data);
      res.status(201).json(layoff);
    } catch (err) {
      res.status(500).json({ error: "Failed to create layoff" });
    }
  });

  return httpServer;
}
