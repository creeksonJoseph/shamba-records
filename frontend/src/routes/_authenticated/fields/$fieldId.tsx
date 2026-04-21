import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Sprout, User as UserIcon } from "lucide-react";
import { api } from "@/lib/api";
import type { Field, Plant } from "@/lib/types";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StageBadge, StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";

export default function FieldDetailPage() {
  const { fieldId } = useParams<{ fieldId: string }>();

  const { data: field, isLoading } = useQuery({
    queryKey: ["field", fieldId],
    queryFn: () => api<Field>(`/fields/${fieldId}/`),
  });

  const { data: plants } = useQuery({
    queryKey: ["plants"],
    queryFn: () => api<Plant[]>("/plants/"),
  });

  const fieldPlants = (plants ?? []).filter((p) =>
    (typeof p.field === "object" && p.field !== null && "id" in p.field) 
      ? p.field.id === fieldId 
      : p.field === fieldId,
  );

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
        <Link to="/fields">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to fields
        </Link>
      </Button>

      {isLoading || !field ? (
        <Skeleton className="mb-6 h-24 w-full" />
      ) : (
        <PageHeader
          title={field.name}
          description={field.location}
        />
      )}

      {field && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <InfoTile icon={MapPin} label="Location" value={field.location} />
          <InfoTile
            icon={UserIcon}
            label="Agent"
            value={field.assigned_agent?.name ?? "Unassigned"}
          />
          <InfoTile
            icon={UserIcon}
            label="Created by"
            value={field.created_by?.name ?? "—"}
          />
        </div>
      )}

      <h2 className="mb-3 font-display text-xl">Plants in this field</h2>
      {!plants ? (
        <Skeleton className="h-32 w-full" />
      ) : fieldPlants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <Sprout className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No plants logged for this field yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {fieldPlants.map((p) => (
            <Link
              key={p.id}
              to={`/plants/${p.id}`}
              className="group"
            >
              <Card className="transition hover:border-primary/40 hover:shadow-sm">
                <CardContent className="flex items-center gap-3 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Sprout className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium group-hover:text-primary">{p.crop_type}</div>
                    <div className="text-xs text-muted-foreground">
                      Planted {format(new Date(p.planting_date), "MMM d, yyyy")}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={p.status} />
                    <StageBadge stage={p.stage} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="truncate text-sm font-medium">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
