import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Plus, Search, Sprout } from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";
import type { Field, Plant, Stage, Status } from "@/lib/types";
import { usePlants } from "@/api/hooks/usePlants";
import { useFields } from "@/api/hooks/useFields";
import { NewPlantDialog } from "@/components/plants/NewPlantDialog";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StageBadge, StatusBadge } from "@/components/StatusBadge";

const STAGES: Stage[] = ["planted", "growing", "ready", "harvested"];
const STATUSES: Status[] = ["active", "at_risk", "completed"];

export default function PlantsPage() {
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [fieldFilter, setFieldFilter] = useState<string>("all");

  const { data: plants, isLoading } = usePlants();
  const { data: fields } = useFields();

  const filtered = useMemo(() => {
    if (!plants) return [];
    return plants.filter((p) => {
      if (q && !p.crop_type.toLowerCase().includes(q.toLowerCase())) return false;
      if (stage !== "all" && p.stage !== stage) return false;
      if (status !== "all" && p.status !== status) return false;
      if (fieldFilter !== "all") {
        const fid = typeof p.field === "object" && p.field !== null && "id" in p.field ? p.field.id : p.field;
        if (fid !== fieldFilter) return false;
      }
      return true;
    });
  }, [plants, q, stage, status, fieldFilter]);

  return (
    <>
      <PageHeader
        title="Plants"
        description="Every crop you’re tracking across your fields."
        actions={<NewPlantDialog fields={fields ?? []} />}
      />

      <div className="mb-5 flex flex-col gap-2 md:grid md:grid-cols-[1fr_repeat(3,minmax(140px,180px))]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search crops..." className="pl-9" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:contents">
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger><SelectValue placeholder="Stage" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {STAGES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="col-span-2 sm:col-span-1 md:contents">
            <Select value={fieldFilter} onValueChange={setFieldFilter}>
              <SelectTrigger><SelectValue placeholder="Field" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All fields</SelectItem>
                {(fields ?? []).map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Sprout className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No plants match your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const planted = new Date(p.planting_date);
            const expectedHarvest = addDays(planted, p.expected_days);
            const daysLeft = differenceInDays(expectedHarvest, new Date());
            const fieldObj = typeof p.field === "object" && p.field !== null ? p.field : fields?.find(f => typeof p.field === "string" && f.id === p.field);
            const fieldName = fieldObj ? fieldObj.name : "Unknown Field";
            return (
              <Link key={p.id} to={`/plants/${p.id}`} className="group">
                <Card className="h-full transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                  <CardContent className="flex h-full flex-col gap-3 py-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-xl leading-tight group-hover:text-primary">
                          {p.crop_type}
                        </h3>
                        <div className="text-xs text-muted-foreground">
                          {fieldName}
                        </div>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <StageBadge stage={p.stage} />
                      <span className="text-muted-foreground">
                        {daysLeft >= 0 ? `${daysLeft}d left` : `${-daysLeft}d overdue`}
                      </span>
                    </div>
                    <div className="border-t border-border pt-2 text-xs text-muted-foreground">
                      Planted {format(planted, "MMM d, yyyy")}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}


