import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sun, Moon, Search, TrendingDown, X, Zap, AlertTriangle, ArrowDown, ArrowUp, Minus, Skull, Flame, Users, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import type { Layoff } from "@shared/schema";

const TYPE_META: Record<string, { label: string; color: string; shortLabel: string }> = {
  "2026": {
    label: "AI replaced them",
    shortLabel: "AI",
    color: "bg-violet-500/15 text-violet-400 dark:text-violet-400 border-violet-500/20",
  },
  "2022": {
    label: "Hired too many",
    shortLabel: "Bloat",
    color: "bg-amber-500/15 text-amber-500 dark:text-amber-400 border-amber-500/20",
  },
  "2008": {
    label: "Losing money",
    shortLabel: "$$",
    color: "bg-rose-500/15 text-rose-500 dark:text-rose-400 border-rose-500/20",
  },
};

const LOGO_BG: Record<string, string> = {
  block: "bg-black dark:bg-white dark:text-black text-white",
  amazon: "bg-[#FF9900] text-black",
  microsoft: "bg-[#00A4EF] text-white",
  google: "bg-white dark:bg-neutral-200 text-black",
  meta: "bg-[#0082FB] text-white",
  intel: "bg-[#0071C5] text-white",
  salesforce: "bg-[#00A1E0] text-white",
  cisco: "bg-[#049FD9] text-white",
  spotify: "bg-[#1DB954] text-white",
  unity: "bg-black dark:bg-white dark:text-black text-white",
  tesla: "bg-[#CC0000] text-white",
};

const LOGO_INITIALS: Record<string, string> = {
  block: "B", amazon: "A", microsoft: "M", google: "G", meta: "M",
  intel: "I", salesforce: "SF", cisco: "C", spotify: "S", unity: "U", tesla: "T",
};

type SortKey = "danger" | "headcount" | "percentage" | "recent";

const SORT_OPTIONS: { value: SortKey; label: string; icon: typeof Skull }[] = [
  { value: "danger", label: "Danger score", icon: Flame },
  { value: "percentage", label: "% workforce cut", icon: Percent },
  { value: "headcount", label: "Total jobs cut", icon: Users },
  { value: "recent", label: "Most recent", icon: TrendingDown },
];

function getDangerScore(l: Layoff): number {
  let score = 0;
  score += Math.min((l.percentageCut || 0) * 2, 80);
  if (l.layoffType === "2026") score += 20;
  else if (l.layoffType === "2022") score += 8;
  if (l.stockImpact === "positive") score += 5;
  return Math.min(Math.round(score), 100);
}

function getDangerLevel(score: number): { label: string; color: string; barColor: string } {
  if (score >= 70) return { label: "Run", color: "text-rose-500 dark:text-rose-400", barColor: "bg-rose-500" };
  if (score >= 45) return { label: "Risky", color: "text-amber-500 dark:text-amber-400", barColor: "bg-amber-500" };
  return { label: "Watch", color: "text-emerald-500 dark:text-emerald-400", barColor: "bg-emerald-500" };
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function formatDate(d: string): string {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function CompanyLogo({ logo, company }: { logo?: string | null; company: string }) {
  const key = logo || "";
  const bg = LOGO_BG[key] || "bg-secondary text-secondary-foreground";
  const initials = LOGO_INITIALS[key] || company.charAt(0);
  return (
    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 select-none`}>
      {initials}
    </div>
  );
}

function DangerBar({ score }: { score: number }) {
  const level = getDangerLevel(score);
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${level.barColor} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-[11px] font-bold tabular-nums w-7 text-right ${level.color}`}>{score}</span>
    </div>
  );
}

function StockIndicator({ impact }: { impact?: string | null }) {
  if (!impact) return <Minus className="w-3 h-3 text-muted-foreground" />;
  if (impact === "positive") return <ArrowUp className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />;
  if (impact === "negative") return <ArrowDown className="w-3 h-3 text-rose-500 dark:text-rose-400" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
}

function LeaderboardRow({ layoff, rank, onClick }: { layoff: Layoff; rank: number; onClick: () => void }) {
  const score = getDangerScore(layoff);
  const level = getDangerLevel(score);
  const typeMeta = TYPE_META[layoff.layoffType];

  return (
    <button
      data-testid={`row-layoff-${layoff.id}`}
      onClick={onClick}
      className="w-full text-left group"
    >
      <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3.5 hover-elevate rounded-xl transition-all duration-150 flex-wrap">
        <span data-testid={`text-rank-${rank}`} className={`text-lg sm:text-xl font-black tabular-nums w-7 sm:w-8 text-center flex-shrink-0 ${rank <= 3 ? level.color : "text-muted-foreground"}`}>
          {rank}
        </span>

        <CompanyLogo logo={layoff.logo} company={layoff.company} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p data-testid={`text-company-${layoff.id}`} className="font-semibold text-sm text-foreground truncate">{layoff.company}</p>
            <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${typeMeta.color}`}>
              {layoff.layoffType === "2026" && <Zap className="w-2 h-2" />}
              {typeMeta.shortLabel}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span data-testid={`text-cuts-${layoff.id}`} className="font-medium text-foreground">{formatNumber(layoff.employeesCut)}</span>
            <span>cut</span>
            {layoff.percentageCut && (
              <>
                <span className="text-border">|</span>
                <span data-testid={`text-pct-${layoff.id}`}>{layoff.percentageCut}%</span>
              </>
            )}
            <span className="text-border hidden sm:inline">|</span>
            <span className="hidden sm:inline">{formatDate(layoff.date)}</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
          <StockIndicator impact={layoff.stockImpact} />
        </div>

        <div className="flex-shrink-0 w-24 sm:w-28">
          <DangerBar score={score} />
        </div>
      </div>
    </button>
  );
}

function RowSkeleton({ rank }: { rank: number }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3.5">
      <span className="text-lg font-black tabular-nums w-7 sm:w-8 text-center text-muted-foreground">{rank}</span>
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-1.5" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="w-24 h-1.5 rounded-full" />
    </div>
  );
}

function DetailModal({ layoff, rank, onClose }: { layoff: Layoff; rank: number; onClose: () => void }) {
  const score = getDangerScore(layoff);
  const level = getDangerLevel(score);
  const typeMeta = TYPE_META[layoff.layoffType];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg w-full rounded-2xl border border-card-border bg-card p-0 gap-0 overflow-hidden" data-testid="modal-layoff-detail">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start gap-4">
            <div className="relative">
              <CompanyLogo logo={layoff.logo} company={layoff.company} />
              <span className={`absolute -top-1.5 -left-1.5 w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center ${rank <= 3 ? "bg-rose-500 text-white" : "bg-muted text-muted-foreground"}`}>
                {rank}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold text-foreground leading-tight">{layoff.company}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{layoff.industry}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${typeMeta.color}`}>
                  {layoff.layoffType === "2026" && <Zap className="w-2.5 h-2.5" />}
                  {typeMeta.label}
                </span>
                <span className="text-xs text-muted-foreground">{formatDate(layoff.date)}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 pt-5 flex flex-col gap-5">
          <div className="bg-background rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Danger score</span>
              <span className={`text-2xl font-black ${level.color}`}>{score}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${level.barColor} transition-all duration-700`} style={{ width: `${score}%` }} />
            </div>
            <p className={`text-xs font-bold mt-2 ${level.color}`}>{level.label}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background rounded-xl p-4 border border-border">
              <p className="text-3xl font-bold text-foreground">{formatNumber(layoff.employeesCut)}</p>
              <p className="text-xs text-muted-foreground mt-1">jobs eliminated</p>
            </div>
            {layoff.percentageCut != null && (
              <div className="bg-background rounded-xl p-4 border border-border">
                <p className="text-3xl font-bold text-foreground">{layoff.percentageCut}%</p>
                <p className="text-xs text-muted-foreground mt-1">of workforce</p>
              </div>
            )}
          </div>

          {layoff.totalEmployeesBefore && (
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-background rounded-xl p-3 border border-border text-center">
                <p className="text-lg font-bold text-foreground">{formatNumber(layoff.totalEmployeesBefore)}</p>
                <p className="text-[10px] text-muted-foreground">before</p>
              </div>
              <TrendingDown className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <div className="flex-1 bg-background rounded-xl p-3 border border-border text-center">
                <p className="text-lg font-bold text-foreground">{formatNumber(Math.round(layoff.totalEmployeesBefore * (1 - (layoff.percentageCut || 0) / 100)))}</p>
                <p className="text-[10px] text-muted-foreground">after</p>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">What happened</p>
            <p className="text-sm text-foreground leading-relaxed">{layoff.description}</p>
          </div>

          {layoff.ceoQuote && (
            <div className="bg-background border border-border rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">What they said</p>
              <blockquote className="text-sm text-foreground italic leading-relaxed">
                "{layoff.ceoQuote}"
              </blockquote>
            </div>
          )}

          {layoff.stockImpact && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <StockIndicator impact={layoff.stockImpact} />
              <span>
                {layoff.stockImpact === "positive"
                  ? "Stock went up after the announcement. Wall Street loved it."
                  : layoff.stockImpact === "negative"
                  ? "Stock dropped. Investors weren't convinced."
                  : "Stock didn't move much either way."}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Home() {
  const { theme, toggle } = useTheme();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("danger");
  const [selectedLayoff, setSelectedLayoff] = useState<Layoff | null>(null);
  const [selectedRank, setSelectedRank] = useState(0);

  const { data: layoffs = [], isLoading } = useQuery<Layoff[]>({
    queryKey: ["/api/layoffs"],
  });

  const sorted = useMemo(() => {
    const items = [...layoffs];
    switch (sortBy) {
      case "danger":
        return items.sort((a, b) => getDangerScore(b) - getDangerScore(a));
      case "headcount":
        return items.sort((a, b) => b.employeesCut - a.employeesCut);
      case "percentage":
        return items.sort((a, b) => (b.percentageCut || 0) - (a.percentageCut || 0));
      case "recent":
        return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      default:
        return items;
    }
  }, [layoffs, sortBy]);

  const filtered = useMemo(() => {
    if (!search) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (l) =>
        l.company.toLowerCase().includes(q) ||
        l.industry.toLowerCase().includes(q) ||
        l.trigger.toLowerCase().includes(q)
    );
  }, [sorted, search]);

  const totalCut = useMemo(() => layoffs.reduce((sum, l) => sum + l.employeesCut, 0), [layoffs]);

  const handleSelect = (layoff: Layoff, rank: number) => {
    setSelectedLayoff(layoff);
    setSelectedRank(rank);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Header */}
        <header className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <Skull className="w-4 h-4 text-background" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight block leading-tight" data-testid="text-app-title">The Don't Work Here List</span>
              <span className="text-[10px] text-muted-foreground leading-none">updated daily</span>
            </div>
          </div>
          <Button
            data-testid="button-theme-toggle"
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="rounded-xl"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </header>

        {/* Ticker Strip */}
        <div className="flex items-center gap-4 sm:gap-6 mb-8 pb-6 border-b border-border overflow-x-auto" data-testid="section-stats">
          <div className="flex-shrink-0">
            <p data-testid="text-total-jobs" className="text-2xl sm:text-3xl font-black text-foreground tracking-tight tabular-nums">{isLoading ? "..." : formatNumber(totalCut)}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">jobs gone</p>
          </div>
          <div className="w-px h-8 bg-border flex-shrink-0" />
          <div className="flex-shrink-0">
            <p data-testid="text-total-companies" className="text-2xl sm:text-3xl font-black text-foreground tracking-tight tabular-nums">{isLoading ? "..." : layoffs.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">companies</p>
          </div>
          <div className="w-px h-8 bg-border flex-shrink-0" />
          <div className="flex-shrink-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">worst offender</p>
            <p data-testid="text-worst-offender" className="text-sm font-bold text-foreground">{isLoading ? "..." : sorted[0]?.company || "—"}</p>
          </div>
        </div>

        {/* Search + Sort */}
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              data-testid="input-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies..."
              className="w-full bg-card border border-card-border text-sm rounded-xl pl-9 pr-9 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                data-testid="button-clear-search"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                data-testid="button-sort-menu"
                className="text-xs font-medium rounded-xl gap-1.5"
                aria-label="Sort leaderboard"
              >
                {SORT_OPTIONS.find((s) => s.value === sortBy)?.label || "Sort"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  data-testid={`sort-option-${opt.value}`}
                  onClick={() => setSortBy(opt.value)}
                  className={`text-xs gap-2 ${sortBy === opt.value ? "font-semibold" : ""}`}
                >
                  <opt.icon className="w-3 h-3" />
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Column headers */}
        <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-2 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
          <span className="w-7 sm:w-8 text-center">#</span>
          <span className="w-10" />
          <span className="flex-1">Company</span>
          <span className="hidden sm:block w-5" />
          <span className="w-24 sm:w-28 text-right">Danger</span>
        </div>

        {/* Leaderboard */}
        <section data-testid="section-leaderboard" className="flex flex-col">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} rank={i + 1} />)
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mb-4">
                <Search className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Nobody here</p>
              <p className="text-xs text-muted-foreground">Try a different search</p>
            </div>
          ) : (
            filtered.map((layoff, i) => (
              <LeaderboardRow
                key={layoff.id}
                layoff={layoff}
                rank={i + 1}
                onClick={() => handleSelect(layoff, i + 1)}
              />
            ))
          )}
        </section>

        {/* Legend */}
        {!isLoading && (
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3">Why they cut</p>
            <div className="flex gap-3 flex-wrap">
              {Object.entries(TYPE_META).map(([key, meta]) => (
                <div key={key} className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${meta.color}`}>
                  {key === "2026" && <Zap className="w-2.5 h-2.5" />}
                  {key === "2022" && <AlertTriangle className="w-2.5 h-2.5" />}
                  {key === "2008" && <TrendingDown className="w-2.5 h-2.5" />}
                  {meta.label}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed max-w-md">
              Danger score = how much of the workforce they cut + why. AI-structural layoffs score highest because the jobs aren't coming back.
            </p>
          </div>
        )}

        {/* Detail Modal */}
        {selectedLayoff && (
          <DetailModal layoff={selectedLayoff} rank={selectedRank} onClose={() => setSelectedLayoff(null)} />
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Skull className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">The Don't Work Here List</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Feb 2026</p>
        </footer>
      </div>
    </div>
  );
}
