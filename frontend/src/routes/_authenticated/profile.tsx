import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Mail, Shield, User as UserIcon } from "lucide-react";
import { api, type AuthUser } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: me, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api<AuthUser>("/auth/me/"),
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <PageHeader title="Profile" description="Your account details." />

      <div className="max-w-xl">
        {isLoading || !me ? (
          <Skeleton className="h-40 w-full rounded-xl" />
        ) : (
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-full ${
                  me.role === "admin" ? "bg-accent/20 text-accent" : "bg-soil/15 text-soil"
                }`}>
                  {me.role === "admin" ? <Shield className="h-7 w-7" /> : <UserIcon className="h-7 w-7" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-2xl">{me.name}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" /> {me.email}
                  </div>
                  <Badge variant="outline" className="mt-2 capitalize">{me.role}</Badge>
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
