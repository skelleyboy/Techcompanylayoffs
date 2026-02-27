# LayoffTracker

A sleek, Apple-inspired tech layoffs tracker that monitors the shift from financial-driven cuts to AI-structural workforce reductions.

## Overview

LayoffTracker provides a clean, mobile-first interface to browse and understand major tech layoffs across three distinct eras:
- **2026-style (AI-Structural)**: AI replaces coordination work — e.g. Block, Inc. cutting 40%
- **2022-style (Overcorrection)**: Over-hiring correction — e.g. Amazon, Meta, Google
- **2008-style (Downturn)**: Pure financial pressure — e.g. Intel

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Shadcn UI
- **Backend**: Express.js API server
- **Storage**: In-memory (MemStorage) — pre-seeded with 11 real-world layoff events
- **Routing**: Wouter (client-side)
- **State**: TanStack Query for data fetching
- **Theme**: Dark/light mode with ThemeProvider, defaults to dark

## Key Features

- Hero stats bar: total jobs cut, companies tracked, AI-driven count
- Three-era taxonomy cards (2026/2022/2008 visual distinction)
- Search by company name, industry, or trigger
- Filter by layoff type
- Detail modal with full breakdown: employee counts, CEO quotes, stock impact
- Mobile-first responsive design
- Dark/light mode toggle

## File Structure

```
client/src/
  pages/home.tsx         - Main tracker page (all UI)
  components/
    theme-provider.tsx   - Dark/light mode context
    ui/                  - Shadcn components
  App.tsx                - Root app with providers and routing

server/
  routes.ts              - GET /api/layoffs, GET /api/layoffs/:id, POST /api/layoffs
  storage.ts             - MemStorage with seed data for 11 companies
  index.ts               - Express server entry

shared/
  schema.ts              - Layoff and User types (Drizzle + Zod)
```

## API Endpoints

- `GET /api/layoffs` — Returns all layoffs sorted by date descending
- `GET /api/layoffs/:id` — Returns a single layoff by ID
- `POST /api/layoffs` — Creates a new layoff record

## Seeded Data

11 companies pre-loaded:
Block, Amazon, Microsoft, Google, Meta, Intel, Salesforce, Cisco, Spotify, Unity, Tesla

## Design Notes

- Apple-inspired minimal aesthetic
- Inter font (system-ui fallback)
- Color-coded layoff type badges: violet (AI-Structural), amber (Overcorrection), rose (Downturn)
- Company logos rendered as styled initials with brand-accurate background colors
- Card grid layout with hover elevation effects
