import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Plus, Mail, Shield, User as UserIcon, Trash2, ChevronDown, ChevronRight, MapPinned } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { NewUserDialog } from "@/components/users/NewUserDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUsers, useDeleteUser } from "@/api/hooks/useUsers";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data: users, isLoading } = useUsers();
  const deleteMutation = useDeleteUser();

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const [visibleLimit, setVisibleLimit] = useState(12);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleLimit((prev) => prev + 12);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => observer.disconnect();
  }, [users?.length]);

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage administrators and field agents."
        actions={<NewUserDialog />}
      />

      <Card>
        {/* Table header */}
        <div className="hidden md:grid md:grid-cols-[1fr_1fr_100px_120px_48px] items-center gap-4 border-b border-border px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">
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
            {users.slice(0, visibleLimit).map((u) => {
              const isExpanded = expandedId === u.id;
              const isAgent = u.role === "agent";
              const fieldCount = u.assigned_fields?.length ?? 0;

              return (
                <div key={u.id}>
                  {/* Main row */}
                  <div
                    className={`flex items-center justify-between md:grid md:grid-cols-[1fr_1fr_100px_120px_48px] gap-2 md:gap-4 px-4 py-3 transition-colors ${
                      isAgent ? "cursor-pointer hover:bg-muted/40" : ""
                    } ${isExpanded ? "bg-muted/30" : ""}`}
                    onClick={() => isAgent && toggleExpand(u.id)}
                  >
                    {/* Name & Mobile Context */}
                    <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs ${
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
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-medium text-sm">{u.name}</span>
                        {/* Mobile summary layer: below name on small screens, hidden on md */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground md:hidden mt-0.5">
                           <span className="capitalize border border-border px-1.5 py-0.5 rounded text-[10px]">{u.role}</span>
                           {isAgent && (
                             <span className="flex items-center gap-0.5 shrink-0">
                               <MapPinned className="h-3 w-3" /> {fieldCount}
                             </span>
                           )}
                           <span className="truncate">{u.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Email */}
                    <div className="hidden md:flex items-center gap-1 min-w-0 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{u.email}</span>
                    </div>

                    {/* Desktop Role */}
                    <Badge variant="outline" className="hidden md:inline-flex capitalize w-fit">
                      {u.role}
                    </Badge>

                    {/* Desktop Assigned fields */}
                    <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
                      {isAgent ? (
                        <>
                          <MapPinned className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {fieldCount === 0
                              ? "No fields"
                              : `${fieldCount} field${fieldCount !== 1 ? "s" : ""}`}
                          </span>
                          {isExpanded
                            ? <ChevronDown className="h-3.5 w-3.5 ml-auto shrink-0" />
                            : <ChevronRight className="h-3.5 w-3.5 ml-auto shrink-0" />}
                        </>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </div>

                    {/* Actions and mobile expand indicator */}
                    <div className="flex items-center justify-end gap-1 shrink-0 ml-auto md:ml-0">
                      {/* Show chevron on mobile for agents */}
                      {isAgent && (
                         <div className="flex md:hidden items-center justify-center h-8 w-8 text-muted-foreground">
                           {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                         </div>
                      )}

                      {u.id !== currentUser?.id && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently remove {u.name} from the system and completely revoke their access.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => deleteMutation.mutate(u.id)}
                                >
                                  Remove User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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

      {/* Intersection observer target for infinite scrolling */}
      {!isLoading && users && visibleLimit < users.length && (
        <div ref={observerTarget} className="mt-8 flex justify-center py-4">
          <Skeleton className="h-8 w-8 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
        </div>
      )}
    </>
  );
}


