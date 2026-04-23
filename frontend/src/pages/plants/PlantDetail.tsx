import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ClipboardList, Layers, MessageSquarePlus, Sprout } from "lucide-react";
import { format, addDays, differenceInDays, formatDistanceToNow } from "date-fns";
import { useAuth } from "@/lib/auth";
import type { Plant } from "@/lib/types";
import { usePlant } from "@/api/hooks/usePlants";
import { UpdateStageDialog } from "@/components/plants/UpdateStageDialog";
import { AddObservationDialog } from "@/components/plants/AddObservationDialog";
import { FlagStatusSection } from "@/components/plants/FlagStatusSection";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";


export default function PlantDetailPage() {
  const { plantId } = useParams<{ plantId: string }>();
  const { data: plant, isLoading } = usePlant(plantId!);

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link to="/plants"><ArrowLeft className="mr-1 h-4 w-4" /> Back to plants</Link>
      </Button>

      {isLoading || !plant ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <PlantDetail plant={plant} />
      )}
    </>
  );
}

function PlantDetail({ plant }: { plant: Plant }) {
  const { user } = useAuth();
  const planted = new Date(plant.planting_date);
  const harvest = addDays(planted, plant.expected_days);
  const daysLeft = differenceInDays(harvest, new Date());
  const fieldName = typeof plant.field === "object" && plant.field !== null && "name" in plant.field ? plant.field.name : "";

  const updates = [...(plant.updates ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const canEdit = user?.role === "agent";

  return (
    <>
      <PageHeader
        title={plant.crop_type}
        description={fieldName}
        actions={
          canEdit ? (
            <div className="flex gap-2">
              <UpdateStageDialog plant={plant} />
              <AddObservationDialog plantId={plant.id} />
            </div>
          ) : undefined
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Status"><StatusBadge status={plant.status} /></Tile>
        <Tile label="Stage"><StageBadge stage={plant.stage} /></Tile>
        <Tile label="Planted">{format(planted, "MMM d, yyyy")}</Tile>
        <Tile label={daysLeft >= 0 ? "Days to harvest" : "Overdue by"}>
          <span className={daysLeft < 0 ? "text-warning-foreground" : ""}>
            {Math.abs(daysLeft)} days
          </span>
        </Tile>
      </div>

      {/* Manual status flag — agents only */}
      {canEdit && (
        <FlagStatusSection plant={plant} />
      )}

      {plant.notes && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Notes</div>
            <p className="text-sm">{plant.notes}</p>
          </CardContent>
        </Card>
      )}

      <h2 className="mb-3 flex items-center gap-2 font-display text-xl">
        <ClipboardList className="h-5 w-5 text-primary" /> Timeline
      </h2>

      {updates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
            <Sprout className="h-8 w-8 opacity-50" />
            No updates yet. Log your first observation.
          </CardContent>
        </Card>
      ) : (
        <ol className="relative space-y-5 border-l border-border pl-6">
          {updates.map((u) => (
            <li key={u.id} className="relative">
              <span
                className={`absolute -left-[31px] top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background ${
                  u.new_stage ? "bg-primary text-primary-foreground" : "bg-soil text-soil-foreground"
                }`}
              >
                {u.new_stage ? <Layers className="h-3 w-3" /> : <MessageSquarePlus className="h-3 w-3" />}
              </span>
              <Card>
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {u.created_by && <span className="font-medium text-foreground">{u.created_by.name}</span>}
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}</span>
                    {u.new_stage && (
                      <>
                        <span>·</span>
                        <StageBadge stage={u.new_stage} />
                      </>
                    )}
                  </div>
                  {u.observation && <p className="mt-2 text-sm">{u.observation}</p>}
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-1 text-sm font-medium">{children}</div>
      </CardContent>
    </Card>
  );
}


