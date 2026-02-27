# The Don't Work Here List

A ranked leaderboard of the worst tech companies to work at right now — with danger scores, layoff data, and the receipts.

## Overview

Tracks major tech layoffs with a fun, editorial leaderboard format. Companies are ranked by "danger score" based on how much they cut and why. Designed to be checked daily by job seekers.

Three layoff eras:
- **AI-Structural (2026)**: AI replaces coordination work — e.g. Block cutting 40%
- **Overcorrection (2022)**: Over-hiring correction — e.g. Amazon, Meta
- **Downturn (2008)**: Pure financial pressure — e.g. Intel

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Shadcn UI
- **Backend**: Express.js API server
- **Storage**: In-memory (MemStorage) — pre-seeded with 100 companies
- **Routing**: Wouter (client-side)
- **State**: TanStack Query for data fetching
- **Theme**: Dark/light mode with ThemeProvider, defaults to dark

## Key Features

- Ranked leaderboard with danger scores (0-100)
- Sort by: danger score, % cut, total headcount, most recent
- Search by company name, industry, or trigger
- Detail modal with full breakdown: employee counts, layoff timeline, CEO quotes, stock impact
- Ticker strip stats: total jobs gone, companies, worst offender
- Legend explaining layoff types and scoring
- Mobile-first responsive design
- Dark/light mode toggle

## File Structure

```
client/src/
  pages/home.tsx         - Main leaderboard page
  components/
    theme-provider.tsx   - Dark/light mode context
    ui/                  - Shadcn components
  App.tsx                - Root app with providers and routing

server/
  routes.ts              - GET /api/layoffs, GET /api/layoffs/:id, POST /api/layoffs
  storage.ts             - MemStorage with seed data for 100 companies + layoff history
  index.ts               - Express server entry

shared/
  schema.ts              - Layoff and User types (Drizzle + Zod)
```

## API Endpoints

- `GET /api/layoffs` — Returns all layoffs sorted by date descending
- `GET /api/layoffs/:id` — Returns a single layoff by ID
- `POST /api/layoffs` — Creates a new layoff record

## Seeded Data

100 companies with layoff history (multiple rounds per company where applicable). Each company includes a `layoffHistory` field — an array of `{date, count, note?}` objects representing individual layoff rounds. Schema exports `LayoffRound` type.

## Design Notes

- Apple-inspired minimal aesthetic, leaderboard format
- Inter font (system-ui fallback)
- Danger score: % cut * 2 + type bonus (AI=+20) + stock bonus
- Color-coded type badges: violet (AI), amber (Bloat), rose (Downturn)
- Company logos as styled initials with brand-accurate colors
- Shadcn DropdownMenu for sort control
