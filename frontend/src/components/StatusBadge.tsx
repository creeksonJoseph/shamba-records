import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Stage, Status } from "@/lib/types";

const statusStyles: Record<Status, string> = {
  active: "bg-success/15 text-success border border-success/30",
  at_risk: "bg-warning/20 text-warning-foreground border border-warning/40",
  completed: "bg-muted text-muted-foreground border border-border",
};

const stageStyles: Record<Stage, string> = {
  planted: "bg-sand text-soil border border-soil/20",
  growing: "bg-primary-soft text-primary border border-primary/30",
  ready: "bg-accent/20 text-accent-foreground border border-accent/40",
  harvested: "bg-soil/15 text-soil border border-soil/30",
};

const statusLabel: Record<Status, string> = {
  active: "Active",
  at_risk: "At risk",
  completed: "Completed",
};

const stageLabel: Record<Stage, string> = {
  planted: "Planted",
  growing: "Growing",
  ready: "Ready",
  harvested: "Harvested",
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <Badge variant="outline" className={cn("rounded-full font-medium", statusStyles[status], className)}>
      {statusLabel[status]}
    </Badge>
  );
}

export function StageBadge({ stage, className }: { stage: Stage; className?: string }) {
  return (
    <Badge variant="outline" className={cn("rounded-full font-medium", stageStyles[stage], className)}>
      {stageLabel[stage]}
    </Badge>
  );
}
