import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Mail, Shield, User as UserIcon, Trash2, ChevronDown, ChevronRight, MapPinned } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { NewUserDialog } from "@/components/users/NewUserDialog";
import { useUsers, useDeleteUser } from "@/api/hooks/useUsers";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data: users, isLoading } = useUsers();
  const deleteMutation = useDeleteUser();

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage administrators and field agents."
        actions={<NewUserDialog />}
      />

      <Card>
        {/* Table header */}
        <div className="grid grid-cols-[1fr_1fr_100px_120px_48px] items-center gap-4 border-b border-border px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Assigned fields</span>
          <span />
        </div>

        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-4 py-3">
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        ) : !users || users.length === 0 ? (
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No users yet.
          </CardContent>
        ) : (
          <div className="divide-y divide-border">
            {users.map((u) => {
              const isExpanded = expandedId === u.id;
              const isAgent = u.role === "agent";
              const fieldCount = u.assigned_fields?.length ?? 0;

              return (
                <div key={u.id}>
                  {/* Main row */}
                  <div
                    className={`grid grid-cols-[1fr_1fr_100px_120px_48px] items-center gap-4 px-4 py-3 transition-colors ${
                      isAgent ? "cursor-pointer hover:bg-muted/40" : ""
                    } ${isExpanded ? "bg-muted/30" : ""}`}
                    onClick={() => isAgent && toggleExpand(u.id)}
                  >
                    {/* Name */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs ${
                          u.role === "admin"
                            ? "bg-accent/20 text-accent"
                            : "bg-soil/15 text-soil"
                        }`}
                      >
                        {u.role === "admin" ? (
                          <Shield className="h-4 w-4" />
                        ) : (
                          <UserIcon className="h-4 w-4" />
                        )}
                      </div>
                      <span className="truncate font-medium text-sm">{u.name}</span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-1 min-w-0 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{u.email}</span>
                    </div>

                    {/* Role */}
                    <Badge variant="outline" className="capitalize w-fit">
                      {u.role}
                    </Badge>

                    {/* Assigned fields */}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {isAgent ? (
                        <>
                          <MapPinned className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {fieldCount === 0
                              ? "No fields"
                              : `${fieldCount} field${fieldCount !== 1 ? "s" : ""}`}
                          </span>
                          {isAgent && (
                            isExpanded
                              ? <ChevronDown className="h-3.5 w-3.5 ml-auto" />
                              : <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </div>

                    {/* Delete */}
                    <div className="flex justify-end">
                      {u.id !== currentUser?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          disabled={deleteMutation.isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Remove ${u.name}?`)) {
                              deleteMutation.mutate(u.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expanded fields panel */}
                  {isExpanded && isAgent && (
                    <div className="border-t border-border bg-muted/20 px-6 py-3">
                      {fieldCount === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                          No fields assigned to {u.name} yet.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {u.assigned_fields!.map((f) => (
                            <Link
                              key={f.id}
                              to={`/fields/${f.id}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-primary/10 hover:border-primary/40 hover:text-primary"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MapPinned className="h-3.5 w-3.5" />
                              {f.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}


