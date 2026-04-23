import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useDashboard } from "@/api/hooks/useDashboard";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StageBadge, StatusBadge } from "@/components/StatusBadge";
import {
  ArrowRight,
  Sprout,
  MapPinned,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ClipboardList,
  Layers,
  MessageSquarePlus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type React from "react";

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "success" | "warning" | "muted" | "soil";
}) {
  const tones: Record<string, string> = {
    default: "bg-primary-soft text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/25 text-warning-foreground",
    muted: "bg-muted text-muted-foreground",
    soil: "bg-soil/15 text-soil",
  };
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="font-display text-2xl leading-tight">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function StageBar({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  const labels: Record<string, string> = {
    planted: "Planted",
    growing: "Growing",
    ready: "Ready",
    harvested: "Harvested",
  };
  return (
    <div className="space-y-3">
      {entries.map(([k, v]) => (
        <div key={k}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium">{labels[k] ?? k}</span>
            <span className="text-muted-foreground">{v}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(v / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusDonut({ data }: { data: Record<string, number> }) {
  const total = Math.max(1, Object.values(data).reduce((a, b) => a + b, 0));
  const colors: Record<string, string> = {
    active: "var(--success)",
    at_risk: "var(--warning)",
    completed: "var(--muted-foreground)",
  };
  let acc = 0;
  const segments = Object.entries(data).map(([k, v]) => {
    const start = (acc / total) * 360;
    acc += v;
    const end = (acc / total) * 360;
    return `${colors[k] ?? "var(--primary)"} ${start}deg ${end}deg`;
  });
  const realTotal = Object.values(data).reduce((a, b) => a + b, 0);
  return (
    <div className="flex items-center gap-5">
      <div
        className="relative h-32 w-32 rounded-full"
        style={{ background: `conic-gradient(${segments.join(",")})` }}
      >
        <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-card">
          <div className="font-display text-2xl">{realTotal}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Plants</div>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {Object.entries(data).map(([k, v]) => (
          <li key={k} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: colors[k] ?? "var(--primary)" }}
            />
            <span className="capitalize">{k.replace("_", " ")}</span>
            <span className="ml-auto font-medium">{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data, isLoading, error } = useDashboard();

  const [showStats, setShowStats] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [showLists, setShowLists] = useState(false);

  useEffect(() => {
    if (data && !isLoading) {
      setShowStats(true);
      const t1 = setTimeout(() => setShowCharts(true), 150);
      const t2 = setTimeout(() => setShowLists(true), 300);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setShowStats(false);
      setShowCharts(false);
      setShowLists(false);
    }
  }, [data, isLoading]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`A snapshot of ${isAdmin ? "all" : "your"} fields, crops and activity.`}
      />

      {error && (
        <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {(error as Error).message}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
        {!showStats || !data ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[88px] rounded-xl" />)
        ) : (
          <>
            <StatCard label="Fields" value={data.total_fields} icon={MapPinned} />
            <StatCard label="Plants" value={data.total_plants} icon={Sprout} tone="soil" />
            <StatCard label="Active" value={data.by_status.active ?? 0} icon={Activity} tone="success" />
            <StatCard label="At risk" value={data.by_status.at_risk ?? 0} icon={AlertTriangle} tone="warning" />
            <StatCard
              label="Completed"
              value={data.by_status.completed ?? 0}
              icon={CheckCircle2}
              tone="muted"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">By status</CardTitle>
          </CardHeader>
          <CardContent>
            {!showCharts || !data ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <StatusDonut data={data.by_status} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">By stage</CardTitle>
          </CardHeader>
          <CardContent>
            {!showCharts || !data ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <StageBar data={data.by_stage} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* At risk + recent updates */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-display text-xl">
              <AlertTriangle className="h-5 w-5 text-warning-foreground" /> At risk plants
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showLists || !data ? (
              <Skeleton className="h-40 w-full" />
            ) : data.at_risk_plants.length === 0 ? (
              <EmptyState icon={CheckCircle2} text="Nothing at risk — great job!" />
            ) : (
              <ul className="divide-y divide-border">
                {data.at_risk_plants.slice(0, 6).map((p) => (
                  <li
                    key={p.id}
                    className="flex cursor-pointer items-center gap-3 py-3"
                    onClick={() => navigate(`/plants/${p.id}`)}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/20 text-warning-foreground">
                      <Sprout className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{p.crop_type}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {typeof p.field === "object" && p.field !== null && "name" in p.field ? p.field.name : ""}
                      </div>
                    </div>
                    <StageBadge stage={p.stage} className="hidden sm:inline-flex" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-xl">
              <ClipboardList className="h-5 w-5 text-primary" /> Recent updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showLists || !data ? (
              <Skeleton className="h-40 w-full" />
            ) : data.recent_updates.length === 0 ? (
              <EmptyState icon={ClipboardList} text="No updates yet." />
            ) : (
              <ul className="divide-y divide-border">
                {data.recent_updates.map((u) => (
                  <li key={u.id} className="flex gap-3 py-3">
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        u.new_stage
                          ? "bg-primary-soft text-primary"
                          : "bg-soil/15 text-soil"
                      }`}
                    >
                      {u.new_stage ? (
                        <Layers className="h-4 w-4" />
                      ) : (
                        <MessageSquarePlus className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {/* Action sentence — full context for both roles */}
                      <div className="text-sm font-medium">
                        {u.new_stage ? (
                          <span>
                            <Link
                              to={u.plant ? `/plants/${u.plant.id}` : "#"}
                              className="hover:underline"
                            >
                              {u.plant?.crop_type ?? "Plant"}
                            </Link>
                            {u.plant?.field_name && (
                              <span className="font-normal text-muted-foreground"> in {u.plant.field_name}</span>
                            )}
                            <span className="font-normal text-muted-foreground"> changed to </span>
                            <span className="capitalize">{u.new_stage}</span>
                          </span>
                        ) : (
                          <span>
                            <Link
                              to={u.plant ? `/plants/${u.plant.id}` : "#"}
                              className="hover:underline"
                            >
                              {u.plant?.crop_type ?? "Plant"}
                            </Link>
                            {u.plant?.field_name && (
                              <span className="font-normal text-muted-foreground"> in {u.plant.field_name}</span>
                            )}
                          </span>
                        )}
                      </div>
                      {/* Observation note if present */}
                      {u.observation && (
                        <div className="mt-0.5 text-sm text-muted-foreground">{u.observation}</div>
                      )}
                      {/* Third line: by agent (admin only) · time */}
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        {isAdmin && u.agent && (
                          <>
                            <span>by <span className="font-medium text-foreground">{u.agent.name}</span></span>
                            <span>·</span>
                          </>
                        )}
                        <span>{formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                    {u.new_stage && <StageBadge stage={u.new_stage} className="self-start mt-0.5" />}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function EmptyState({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-sm text-muted-foreground">
      <Icon className="h-8 w-8 opacity-50" />
      <p>{text}</p>
    </div>
  );
}
