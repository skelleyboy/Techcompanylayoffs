import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sun, Moon, Search, TrendingDown, Users, Building2, AlertTriangle, X, ExternalLink, ChevronRight, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTheme } from "@/components/theme-provider";
import type { Layoff } from "@shared/schema";

const LAYOFF_TYPES = [
  { value: "all", label: "All" },
  { value: "2026", label: "AI-Structural" },
  { value: "2022", label: "Overcorrection" },
  { value: "2008", label: "Downturn" },
];

const TYPE_META: Record<string, { label: string; color: string; description: string }> = {
  "2026": {
    label: "AI-Structural",
    color: "bg-violet-500/15 text-violet-400 border-violet-500/20",
    description: "AI replaces coordination work",
  },
  "2022": {
    label: "Overcorrection",
    color: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    description: "Over-hiring correction",
  },
  "2008": {
    label: "Downturn",
    color: "bg-rose-500/15 text-rose-400 border-rose-500/20",
    description: "Financial pressure",
  },
};

const STOCK_META: Record<string, { label: string; color: string }> = {
  positive: { label: "Stock rose", color: "text-emerald-400" },
  negative: { label: "Stock fell", color: "text-rose-400" },
  neutral: { label: "Stock flat", color: "text-muted-foreground" },
};

const LOGO_BG: Record<string, string> = {
  block: "bg-black text-white",
  amazon: "bg-[#FF9900] text-black",
  microsoft: "bg-[#00A4EF] text-white",
  google: "bg-white text-black",
  meta: "bg-[#0082FB] text-white",
  intel: "bg-[#0071C5] text-white",
  salesforce: "bg-[#00A1E0] text-white",
  cisco: "bg-[#049FD9] text-white",
  spotify: "bg-[#1DB954] text-white",
  unity: "bg-black text-white",
  tesla: "bg-[#CC0000] text-white",
};

const LOGO_INITIALS: Record<string, string> = {
  block: "B",
  amazon: "A",
  microsoft: "M",
  google: "G",
  meta: "M",
  intel: "I",
  salesforce: "SF",
  cisco: "C",
  spotify: "S",
  unity: "U",
  tesla: "T",
};

function CompanyLogo({ logo, company, size = "md" }: { logo?: string | null; company: string; size?: "sm" | "md" | "lg" }) {
  const key = logo || "";
  const bg = LOGO_BG[key] || "bg-secondary text-secondary-foreground";
  const initials = LOGO_INITIALS[key] || company.charAt(0);
  const sizeClass = size === "sm" ? "w-9 h-9 text-xs" : size === "lg" ? "w-14 h-14 text-lg" : "w-11 h-11 text-sm";
  return (
    <div className={`${sizeClass} ${bg} rounded-xl flex items-center justify-center font-bold flex-shrink-0 select-none`}>
      {initials}
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const meta = TYPE_META[type] || { label: type, color: "bg-muted text-muted-foreground border-muted", description: "" };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${meta.color}`}>
      {type === "2026" && <Zap className="w-2.5 h-2.5" />}
      {meta.label}
    </span>
  );
}

function StockBadge({ impact }: { impact?: string | null }) {
  if (!impact) return null;
  const meta = STOCK_META[impact] || { label: impact, color: "text-muted-foreground" };
  return <span className={`text-xs font-medium ${meta.color}`}>{meta.label}</span>;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

function formatDate(d: string): string {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function LayoffCard({ layoff, onClick }: { layoff: Layoff; onClick: () => void }) {
  return (
    <button
      data-testid={`card-layoff-${layoff.id}`}
      onClick={onClick}
      className="w-full text-left group cursor-pointer"
    >
      <div className="bg-card border border-card-border rounded-2xl p-5 hover-elevate transition-all duration-200 h-full flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <CompanyLogo logo={layoff.logo} company={layoff.company} size="md" />
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground leading-tight truncate">{layoff.company}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{layoff.industry}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <TypeBadge type={layoff.layoffType} />
            <span className="text-[11px] text-muted-foreground">{formatDate(layoff.date)}</span>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold tracking-tight text-foreground leading-none">
              {formatNumber(layoff.employeesCut)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              jobs cut{layoff.percentageCut ? ` · ${layoff.percentageCut}% of workforce` : ""}
            </p>
          </div>
          {layoff.stockImpact && (
            <StockBadge impact={layoff.stockImpact} />
          )}
        </div>

        <div className="border-t border-border pt-3">
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{layoff.trigger}</p>
        </div>
      </div>
    </button>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-card border border-card-border rounded-2xl p-5 flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Skeleton className="w-11 h-11 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-4 w-28 mb-1.5" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div>
        <Skeleton className="h-8 w-20 mb-1.5" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="border-t border-border pt-3">
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

function DetailModal({ layoff, onClose }: { layoff: Layoff; onClose: () => void }) {
  const typeMeta = TYPE_META[layoff.layoffType];
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg w-full rounded-2xl border border-card-border bg-card p-0 gap-0 overflow-hidden" data-testid="modal-layoff-detail">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start gap-4 mb-4">
            <CompanyLogo logo={layoff.logo} company={layoff.company} size="lg" />
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold text-foreground leading-tight">{layoff.company}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{layoff.industry}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <TypeBadge type={layoff.layoffType} />
                <span className="text-xs text-muted-foreground">{formatDate(layoff.date)}</span>
                {layoff.stockImpact && <StockBadge impact={layoff.stockImpact} />}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 pt-4 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background rounded-xl p-4 border border-border">
              <p className="text-3xl font-bold text-foreground">{formatNumber(layoff.employeesCut)}</p>
              <p className="text-xs text-muted-foreground mt-1">jobs eliminated</p>
            </div>
            {layoff.percentageCut && (
              <div className="bg-background rounded-xl p-4 border border-border">
                <p className="text-3xl font-bold text-foreground">{layoff.percentageCut}%</p>
                <p className="text-xs text-muted-foreground mt-1">of workforce</p>
              </div>
            )}
            {layoff.totalEmployeesBefore && (
              <div className="bg-background rounded-xl p-4 border border-border">
                <p className="text-3xl font-bold text-foreground">{formatNumber(layoff.totalEmployeesBefore)}</p>
                <p className="text-xs text-muted-foreground mt-1">employees before</p>
              </div>
            )}
            {layoff.totalEmployeesBefore && layoff.percentageCut && (
              <div className="bg-background rounded-xl p-4 border border-border">
                <p className="text-3xl font-bold text-foreground">{formatNumber(Math.round(layoff.totalEmployeesBefore * (1 - layoff.percentageCut / 100)))}</p>
                <p className="text-xs text-muted-foreground mt-1">remaining employees</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">What happened</p>
            <p className="text-sm text-foreground leading-relaxed">{layoff.description}</p>
          </div>

          {layoff.ceoQuote && (
            <div className="bg-background border border-border rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">CEO Statement</p>
              <blockquote className="text-sm text-foreground italic leading-relaxed">
                "{layoff.ceoQuote}"
              </blockquote>
            </div>
          )}

          {typeMeta && (
            <div className={`rounded-xl p-4 border ${typeMeta.color}`}>
              <div className="flex items-center gap-2 mb-1">
                {layoff.layoffType === "2026" && <Zap className="w-3.5 h-3.5" />}
                <p className="text-xs font-semibold uppercase tracking-wider">{typeMeta.label} Layoff</p>
              </div>
              <p className="text-xs leading-relaxed opacity-80">{typeMeta.description}</p>
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
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedLayoff, setSelectedLayoff] = useState<Layoff | null>(null);

  const { data: layoffs = [], isLoading } = useQuery<Layoff[]>({
    queryKey: ["/api/layoffs"],
  });

  const filtered = useMemo(() => {
    return layoffs.filter((l) => {
      const matchesSearch =
        !search ||
        l.company.toLowerCase().includes(search.toLowerCase()) ||
        l.industry.toLowerCase().includes(search.toLowerCase()) ||
        l.trigger.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || l.layoffType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [layoffs, search, typeFilter]);

  const totalCut = useMemo(() => layoffs.reduce((sum, l) => sum + l.employeesCut, 0), [layoffs]);
  const aiLayoffs = useMemo(() => layoffs.filter((l) => l.layoffType === "2026").length, [layoffs]);
  const latestDate = useMemo(() => {
    if (!layoffs.length) return "";
    return formatDate(layoffs[0]?.date || "");
  }, [layoffs]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Header */}
        <header className="flex items-center justify-between mb-10 sm:mb-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-background" />
            </div>
            <span className="font-semibold text-sm tracking-tight">LayoffTracker</span>
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

        {/* Hero */}
        <section className="mb-10 sm:mb-14">
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1">
              <Zap className="w-3 h-3" />
              A new era of layoffs
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.05] mb-4">
            Tech layoffs are<br className="hidden sm:block" /> structural now.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
            Block just cut 40% of its workforce — not to save money, but because AI can do the work. This is what the transition looks like.
          </p>
        </section>

        {/* Stats Bar */}
        <section className="grid grid-cols-3 gap-3 sm:gap-4 mb-10 sm:mb-12" data-testid="section-stats">
          <div className="bg-card border border-card-border rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Jobs cut</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{formatNumber(totalCut)}</p>
            )}
          </div>
          <div className="bg-card border border-card-border rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Companies</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{layoffs.length}</p>
            )}
          </div>
          <div className="bg-card border border-card-border rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs text-muted-foreground">AI-driven</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-8" />
            ) : (
              <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{aiLayoffs}</p>
            )}
          </div>
        </section>

        {/* The Pattern */}
        <section className="mb-10 sm:mb-12">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">The three eras</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(TYPE_META).map(([key, meta]) => (
              <div key={key} className={`rounded-2xl p-4 border ${meta.color}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  {key === "2026" && <Zap className="w-3.5 h-3.5" />}
                  {key === "2022" && <AlertTriangle className="w-3.5 h-3.5" />}
                  {key === "2008" && <TrendingDown className="w-3.5 h-3.5" />}
                  <span className="text-xs font-semibold">{key} — {meta.label}</span>
                </div>
                <p className="text-xs opacity-75 leading-relaxed">{meta.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Filters */}
        <section className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {LAYOFF_TYPES.map((t) => (
                <button
                  key={t.value}
                  data-testid={`filter-type-${t.value}`}
                  onClick={() => setTypeFilter(t.value)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150 ${
                    typeFilter === t.value
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-muted-foreground border-border hover-elevate"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                data-testid="input-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search companies..."
                className="w-full sm:w-56 bg-card border border-card-border text-sm rounded-xl pl-9 pr-9 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  data-testid="button-clear-search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Results Count */}
        {!isLoading && (
          <p className="text-xs text-muted-foreground mb-4" data-testid="text-results-count">
            {filtered.length} {filtered.length === 1 ? "company" : "companies"}{typeFilter !== "all" ? ` · ${TYPE_META[typeFilter]?.label || typeFilter}` : ""}
          </p>
        )}

        {/* Card Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="section-layoff-cards">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mb-4">
                <Search className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No results</p>
              <p className="text-xs text-muted-foreground">Try a different search or filter</p>
            </div>
          ) : (
            filtered.map((layoff) => (
              <LayoffCard
                key={layoff.id}
                layoff={layoff}
                onClick={() => setSelectedLayoff(layoff)}
              />
            ))
          )}
        </section>

        {/* Detail Modal */}
        {selectedLayoff && (
          <DetailModal layoff={selectedLayoff} onClose={() => setSelectedLayoff(null)} />
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-foreground rounded-md flex items-center justify-center">
              <TrendingDown className="w-3 h-3 text-background" />
            </div>
            <span className="text-xs text-muted-foreground">LayoffTracker · tracking the AI transition</span>
          </div>
          <p className="text-xs text-muted-foreground">Data updated February 2026</p>
        </footer>
      </div>
    </div>
  );
}
