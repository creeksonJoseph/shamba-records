import { useState } from "react";
import { ShieldAlert, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import type { Plant } from "@/lib/types";
import { useFlagPlant } from "@/api/hooks/usePlants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function FlagStatusSection({ plant }: { plant: Plant }) {
  const [reason, setReason] = useState("");

  const mutation = useFlagPlant();

  const handleFlag = (override: "at_risk" | "healthy" | null) => {
    mutation.mutate(
      { id: plant.id, override, reason: reason || undefined },
      {
        onSuccess: () => {
          const msg =
            override === "at_risk"
              ? "Plant flagged as at risk"
              : override === "healthy"
              ? "Plant marked as healthy"
              : "Status reset to automatic";
          toast.success(msg);
          setReason("");
        },
        onError: (e: Error) => toast.error(e.message),
      }
    );
  };

  const hasOverride = !!plant.status_override;

  return (
    <Card className="mb-6">
      <CardContent className="py-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Manual Status Flag
          </div>
          {hasOverride && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                plant.status_override === "at_risk"
                  ? "bg-warning/20 text-warning-foreground"
                  : "bg-success/15 text-success"
              }`}
            >
              {plant.status_override === "at_risk" ? (
                <ShieldAlert className="h-3 w-3" />
              ) : (
                <ShieldCheck className="h-3 w-3" />
              )}
              {plant.status_override === "at_risk" ? "Manually flagged at risk" : "Manually marked healthy"}
            </span>
          )}
        </div>

        <div className="mb-3">
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Reason (optional — e.g. Disease spotted, Pest damage...)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={plant.status_override === "at_risk" ? "default" : "outline"}
            className={plant.status_override === "at_risk" ? "bg-warning text-warning-foreground hover:bg-warning/90" : ""}
            disabled={mutation.isPending}
            onClick={() => handleFlag("at_risk")}
          >
            <ShieldAlert className="mr-1 h-4 w-4" />
            Flag at risk
          </Button>
          <Button
            size="sm"
            variant={plant.status_override === "healthy" ? "default" : "outline"}
            className={plant.status_override === "healthy" ? "bg-success text-success-foreground hover:bg-success/90" : ""}
            disabled={mutation.isPending}
            onClick={() => handleFlag("healthy")}
          >
            <ShieldCheck className="mr-1 h-4 w-4" />
            Mark healthy
          </Button>
          {hasOverride && (
            <Button
              size="sm"
              variant="ghost"
              disabled={mutation.isPending}
              onClick={() => handleFlag(null)}
            >
              <ShieldOff className="mr-1 h-4 w-4" />
              Reset to auto
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
