import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Plus, Search, MapPin, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { NewFieldDialog } from "@/components/fields/NewFieldDialog";
import { useFields } from "@/api/hooks/useFields";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function FieldsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [q, setQ] = useState("");

  const { data: fields, isLoading } = useFields();

  const filtered = useMemo(() => {
    if (!fields) return [];
    const s = q.trim().toLowerCase();
    if (!s) return fields;
    return fields.filter(
      (f) =>
        f.name.toLowerCase().includes(s) ||
        f.location.toLowerCase().includes(s) ||
        f.assigned_agent?.name.toLowerCase().includes(s),
    );
  }, [fields, q]);

  return (
    <>
      <PageHeader
        title="Fields"
        description="Every plot you manage at a glance."
        actions={isAdmin && <NewFieldDialog />}
      />

      <div className="mb-5 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search fields..."
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <MapPin className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {q ? "No fields match your search." : "No fields yet."}
            </p>
            {isAdmin && !q && <NewFieldDialog />}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => (
            <Link key={f.id} to={`/fields/${f.id}`} className="group">
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                <CardContent className="flex h-full flex-col gap-3 py-5">
                  <div>
                    <h3 className="font-display text-xl leading-tight group-hover:text-primary">
                      {f.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {f.location}
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <UserIcon className="h-3.5 w-3.5" />
                      {f.assigned_agent?.name ?? "Unassigned"}
                    </span>
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

