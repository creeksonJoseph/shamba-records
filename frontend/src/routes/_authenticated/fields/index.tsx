import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Search, MapPin, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Field } from "@/lib/types";
import type { AuthUser, Role } from "@/lib/api";
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

interface UserResp extends AuthUser {
  role: Role;
}

export default function FieldsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [q, setQ] = useState("");

  const { data: fields, isLoading } = useQuery({
    queryKey: ["fields"],
    queryFn: () => api<Field[]>("/fields/"),
  });

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

function NewFieldDialog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [agentId, setAgentId] = useState<string>("");

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => api<UserResp[]>("/users/"),
    enabled: open,
  });

  const agents = useMemo(() => users?.filter((u) => u.role === "agent") ?? [], [users]);

  const mutation = useMutation({
    mutationFn: () =>
      api<Field>("/fields/", {
        method: "POST",
        body: { name, location, assigned_agent: agentId },
      }),
    onSuccess: () => {
      toast.success("Field created");
      qc.invalidateQueries({ queryKey: ["fields"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setOpen(false);
      setName("");
      setLocation("");
      setAgentId("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" /> New field
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">New field</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loc">Location</Label>
            <Input
              id="loc"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Village, region"
            />
          </div>
          <div className="space-y-2">
            <Label>Assigned agent</Label>
            <Select value={agentId} onValueChange={setAgentId} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} — {a.email}
                  </SelectItem>
                ))}
                {agents.length === 0 && (
                  <div className="px-2 py-3 text-center text-xs text-muted-foreground">
                    No agents yet. Add one from Users.
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || !agentId}>
              Create field
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
