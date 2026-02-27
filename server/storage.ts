import { type Layoff, type InsertLayoff, type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getLayoffs(): Promise<Layoff[]>;
  getLayoff(id: string): Promise<Layoff | undefined>;
  createLayoff(layoff: InsertLayoff): Promise<Layoff>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private layoffs: Map<string, Layoff>;
  private users: Map<string, User>;

  constructor() {
    this.layoffs = new Map();
    this.users = new Map();
    this.seed();
  }

  private seed() {
    const entries: Omit<Layoff, "id">[] = [
      {
        company: "Block, Inc.",
        logo: "block",
        industry: "Fintech",
        employeesCut: 4000,
        totalEmployeesBefore: 10000,
        percentageCut: 40,
        trigger: "AI-driven structural redesign",
        layoffType: "2026",
        stockImpact: "positive",
        description: "Jack Dorsey restructured Block around AI efficiency, cutting 40% of the workforce in a single massive round. Not financial distress — a deliberate architectural decision that the company can now run leaner with AI doing coordination work.",
        date: "2026-02-01",
        ceoQuote: "Future companies run lean and AI-native. Management layers shrink. Coordination jobs disappear first.",
        sourceUrl: "https://block.xyz",
      },
      {
        company: "Amazon",
        logo: "amazon",
        industry: "E-Commerce / Cloud",
        employeesCut: 27000,
        totalEmployeesBefore: 1540000,
        percentageCut: 1.75,
        trigger: "Over-hiring correction + automation",
        layoffType: "2022",
        stockImpact: "positive",
        description: "Amazon eliminated roles across retail, HR, and devices divisions after aggressive pandemic hiring. Automation of warehouse and logistics roles accelerated the consolidation of operational teams.",
        date: "2023-01-20",
        ceoQuote: null,
        sourceUrl: null,
      },
      {
        company: "Microsoft",
        logo: "microsoft",
        industry: "Software / Cloud",
        employeesCut: 10000,
        totalEmployeesBefore: 221000,
        percentageCut: 4.5,
        trigger: "AI restructuring",
        layoffType: "2026",
        stockImpact: "positive",
        description: "Microsoft folded multiple product teams into its AI org, eliminating redundant roles. The move signaled a company-wide pivot where AI becomes the core delivery layer for all products.",
        date: "2023-01-18",
        ceoQuote: null,
        sourceUrl: null,
      },
      {
        company: "Google",
        logo: "google",
        industry: "Search / AI",
        employeesCut: 12000,
        totalEmployeesBefore: 190000,
        percentageCut: 6.3,
        trigger: "Efficiency push",
        layoffType: "2022",
        stockImpact: "neutral",
        description: "Google removed middle management layers and consolidated business units under its efficiency mandate. Areas like recruiting, corporate real estate, and some project teams were cut significantly.",
        date: "2023-01-20",
        ceoQuote: null,
        sourceUrl: null,
      },
      {
        company: "Meta Platforms",
        logo: "meta",
        industry: "Social Media / AI",
        employeesCut: 21000,
        totalEmployeesBefore: 87000,
        percentageCut: 24,
        trigger: "Year of efficiency",
        layoffType: "2022",
        stockImpact: "positive",
        description: "Zuckerberg's 'Year of Efficiency' flattened the org chart and removed an entire layer of management. Metaverse projects were deprioritized while AI infrastructure became the key investment.",
        date: "2023-03-14",
        ceoQuote: null,
        sourceUrl: null,
      },
      {
        company: "Intel",
        logo: "intel",
        industry: "Semiconductors",
        employeesCut: 15000,
        totalEmployeesBefore: 124800,
        percentageCut: 15,
        trigger: "Margin pressure + automation",
        layoffType: "2008",
        stockImpact: "negative",
        description: "Intel faced margin compression from AMD and ARM competition alongside automation reducing manufacturing overhead needs. Admin and support roles were cut heavily across global operations.",
        date: "2024-08-01",
        ceoQuote: null,
        sourceUrl: null,
      },
      {
        company: "Salesforce",
        logo: "salesforce",
        industry: "CRM / AI",
        employeesCut: 8000,
        totalEmployeesBefore: 79000,
        percentageCut: 10,
        trigger: "AI-CRM shift",
        layoffType: "2026",
        stockImpact: "positive",
        description: "Salesforce consolidated support and ops roles as AI agents began handling tier-1 customer issues. The company is rebuilding its CRM stack around Agentforce, eliminating manual coordination roles.",
        date: "2023-01-04",
        ceoQuote: null,
        sourceUrl: null,
      },
      {
        company: "Cisco Systems",
        logo: "cisco",
        industry: "Networking",
        employeesCut: 4250,
        totalEmployeesBefore: 84900,
        percentageCut: 5,
        trigger: "Cloud transition",
        layoffType: "2022",
        stockImpact: "neutral",
        description: "Cisco shifted from hardware-centric revenue to software subscriptions, reducing hardware-adjacent roles. The transition to cloud networking eliminated the need for large field and support teams.",
        date: "2024-02-14",
        ceoQuote: null,
        sourceUrl: null,
      },
      {
        company: "Spotify",
        logo: "spotify",
        industry: "Audio Streaming",
        employeesCut: 1500,
        totalEmployeesBefore: 9800,
        percentageCut: 15,
        trigger: "Profitability focus",
        layoffType: "2022",
        stockImpact: "positive",
        description: "Spotify cut podcast and product teams to reach profitability. CEO Daniel Ek cited over-investment in headcount without corresponding revenue growth as the core problem.",
        date: "2023-12-04",
        ceoQuote: null,
        sourceUrl: null,
      },
      {
        company: "Unity Technologies",
        logo: "unity",
        industry: "Game Engine / AI",
        employeesCut: 1800,
        totalEmployeesBefore: 7400,
        percentageCut: 25,
        trigger: "Business model reset",
        layoffType: "2022",
        stockImpact: "negative",
        description: "Unity restructured after a failed runtime fee policy caused massive developer backlash. Engine, ads, and professional services divisions were consolidated, cutting a quarter of the workforce.",
        date: "2024-01-08",
        ceoQuote: null,
        sourceUrl: null,
      },
      {
        company: "Tesla, Inc.",
        logo: "tesla",
        industry: "EV / Robotics",
        employeesCut: 14000,
        totalEmployeesBefore: 140000,
        percentageCut: 10,
        trigger: "Manufacturing automation",
        layoffType: "2026",
        stockImpact: "neutral",
        description: "Tesla cut production support and administrative roles as factory automation reduced the human headcount needed per vehicle. Musk framed it as necessary for competitive pricing against Chinese EVs.",
        date: "2024-04-15",
        ceoQuote: null,
        sourceUrl: null,
      },
    ];

    for (const entry of entries) {
      const id = randomUUID();
      this.layoffs.set(id, { ...entry, id });
    }
  }

  async getLayoffs(): Promise<Layoff[]> {
    return Array.from(this.layoffs.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getLayoff(id: string): Promise<Layoff | undefined> {
    return this.layoffs.get(id);
  }

  async createLayoff(insertLayoff: InsertLayoff): Promise<Layoff> {
    const id = randomUUID();
    const layoff: Layoff = { ...insertLayoff, id };
    this.layoffs.set(id, layoff);
    return layoff;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
