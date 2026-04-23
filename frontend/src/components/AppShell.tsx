import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Sprout, MapPinned, Users, LogOut, User, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }>; adminOnly?: boolean };

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/fields", label: "Fields", icon: MapPinned },
  { to: "/plants", label: "Plants", icon: Sprout },
  { to: "/users", label: "Users", icon: Users, adminOnly: true },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const items = NAV.filter((i) => !i.adminOnly || user?.role === "admin");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border/70 bg-background/85 backdrop-blur transition-all duration-300 ease-in-out z-50 sticky top-0 h-screen",
          isExpanded ? "w-64" : "w-16"
        )}
      >
        <div className="flex h-16 items-center px-4 shrink-0 overflow-hidden border-b border-border/70">
          <Link to="/" className="flex items-center gap-2 min-w-max">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0 mt-0.5">
              <Sprout className="h-4 w-4" />
            </div>
            <div className={cn("leading-tight transition-all duration-300", isExpanded ? "opacity-100 ml-1" : "opacity-0 invisible w-0 ml-0")}>
              <div className="font-display text-xl">Smart Season</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                Farm records
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-2 px-2 py-6 overflow-y-auto overflow-x-hidden">
          {items.map((item) => {
            const active = isActive(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-all group overflow-hidden",
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                )}
                title={!isExpanded ? item.label : undefined}
              >
                <Icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", active && "stroke-[2.5px]")} />
                <span className={cn("transition-all duration-300 whitespace-nowrap origin-left", isExpanded ? "opacity-100 scale-100 w-auto" : "opacity-0 scale-95 w-0")}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="p-2 border-t border-border/70">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium text-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all group overflow-hidden"
            title={!isExpanded ? "Log out" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110 group-hover:stroke-destructive" />
            <span className={cn("transition-all duration-300 whitespace-nowrap origin-left", isExpanded ? "opacity-100 scale-100 w-auto" : "opacity-0 scale-95 w-0")}>
              Log out
            </span>
          </button>
        </div>

        <div className="p-2 border-t border-border/70 flex justify-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 md:px-8">
            <div className="md:hidden">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Sprout className="h-5 w-5" />
                </div>
                <div className="leading-tight">
                  <div className="font-display text-xl">Smart Season</div>
                </div>
              </Link>
            </div>
            <div className="hidden md:flex flex-1"></div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 gap-2 rounded-full px-2 ml-auto">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-soil text-soil-foreground text-xs font-medium">
                      {user ? initials(user.name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left leading-tight md:block">
                    <div className="text-sm font-medium truncate max-w-[150px]">{user?.name}</div>
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {user?.role}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="w-full mx-auto max-w-7xl px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-8 flex-1">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-4">
          {items.map((item) => {
            const active = isActive(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "stroke-[2.4]")} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-display text-3xl leading-tight md:text-4xl">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground md:text-base">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
