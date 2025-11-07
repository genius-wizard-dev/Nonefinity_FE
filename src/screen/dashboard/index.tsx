import { ThemeToggle } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import {
  BookOpen,
  Brain,
  Database,
  FileText,
  Key,
  LayoutDashboard,
  Menu,
  MessageSquare,
  X,
  Zap,
} from "lucide-react";
import "react";
import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
export function Layout() {
  const location = useLocation();
  const { theme } = useTheme();
  // Use public assets for logo; dark mode => Nonefinity_Light.png (for contrast)
  const currentLogo =
    theme === "dark" ? "/Nonefinity_Light.png" : "/Nonefinity_Dark.png";
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  const navigationGroups = [
    {
      label: null, // No label for main features
      items: [
        {
          name: "General",
          href: "/dashboard/general",
          icon: LayoutDashboard,
        },
        {
          name: "Chats",
          href: "/dashboard/chats",
          icon: MessageSquare,
        },
      ],
    },
    {
      label: "Data Management",
      items: [
        {
          name: "Files",
          href: "/dashboard/files",
          icon: FileText,
        },
        {
          name: "Datasets",
          href: "/dashboard/datasets",
          icon: Database,
        },
        {
          name: "Knowledge Stores",
          href: "/dashboard/knowledge-stores",
          icon: BookOpen,
        },
      ],
    },
    {
      label: "Configuration",
      items: [
        {
          name: "Models",
          href: "/dashboard/models",
          icon: Brain,
        },
        {
          name: "Credentials",
          href: "/dashboard/credentials",
          icon: Key,
        },
        {
          name: "Embedding",
          href: "/dashboard/embeddings",
          icon: Zap,
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    // Check if current path matches or starts with the href (for nested routes)
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 ease-in-out bg-card shadow-lg border-r hidden lg:flex flex-col`}
        style={{ willChange: "width" }}
      >
        <div
          className={cn(
            "h-16 flex items-center justify-center px-4 border-b flex-shrink-0",
            sidebarOpen ? "justify-between" : "justify-center"
          )}
        >
          <div
            className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${
              sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
            }`}
          >
            <img
              src={currentLogo}
              alt="Logo"
              className="w-5 h-5 flex-shrink-0"
            />
            <span className="text-lg font-semibold text-foreground whitespace-nowrap">
              Nonefinity
            </span>
          </div>
          <div className="flex items-center gap-1">
            {sidebarOpen && <ThemeToggle className="flex-shrink-0" />}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex-shrink-0 hover:bg-accent transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        <SignedIn>
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
            {navigationGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-1">
                {group.label && sidebarOpen && (
                  <div className="px-3 py-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {group.label}
                    </span>
                  </div>
                )}
                {group.label && !sidebarOpen && (
                  <div className="py-2">
                    <Separator />
                  </div>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link key={item.name} to={item.href} className="block">
                      <Button
                        variant={active ? "secondary" : "ghost"}
                        className={`w-full h-11 transition-all duration-200 justify-center ${
                          sidebarOpen ? "px-3" : "px-0"
                        } ${active ? "shadow-sm" : ""}`}
                      >
                        <div
                          className={`flex items-center ${
                            sidebarOpen ? "w-full" : "justify-center"
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
                              active ? "text-primary" : "text-muted-foreground"
                            }`}
                          />
                          {sidebarOpen && (
                            <span
                              className={`text-sm whitespace-nowrap ml-3 transition-opacity duration-200 ${
                                active ? "font-semibold" : "font-medium"
                              }`}
                            >
                              {item.name}
                            </span>
                          )}
                        </div>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* User Section */}
          <div className="h-20 border-t flex items-center px-4 flex-shrink-0">
            <div
              className={`flex items-center gap-3 w-full ${
                sidebarOpen ? "" : "justify-center"
              }`}
            >
              <div className="flex-shrink-0">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-10 h-10",
                    },
                  }}
                />
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0 animate-in fade-in duration-200">
                  <p className="text-sm font-medium text-foreground truncate">
                    Welcome back!
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Manage your data
                  </p>
                </div>
              )}
            </div>
          </div>
        </SignedIn>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50 shadow-md"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b flex-shrink-0">
              <div className="flex items-center gap-2">
                <img
                  src={currentLogo}
                  alt="Logo"
                  className="w-5 h-5 flex-shrink-0"
                />
                <span className="text-lg font-semibold text-foreground">
                  Nonefinity
                </span>
              </div>
              <ThemeToggle />
            </div>

            <SignedIn>
              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
                {navigationGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="space-y-1">
                    {group.label && (
                      <div className="px-3 py-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {group.label}
                        </span>
                      </div>
                    )}
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link key={item.name} to={item.href}>
                          <Button
                            variant={active ? "secondary" : "ghost"}
                            className="w-full justify-start h-11"
                          >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-medium ml-3">
                              {item.name}
                            </span>
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>

              <Separator />

              {/* User Section */}
              <div className="h-20 flex items-center gap-3 px-6 flex-shrink-0">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-10 h-10",
                    },
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    Welcome back!
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Manage your data
                  </p>
                </div>
              </div>
            </SignedIn>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Theme Toggle for collapsed sidebar - fixed bottom-right */}
        {!sidebarOpen && (
          <div className="fixed bottom-4 right-4 z-50 lg:block hidden">
            <ThemeToggle className="shadow-md" />
          </div>
        )}
        <main className="flex-1 overflow-y-auto">
          <SignedOut>
            <Navigate to="/sign-in" replace />
          </SignedOut>
          <SignedIn>
            <div className="h-full">
              <Outlet />
            </div>
          </SignedIn>
        </main>
      </div>
    </div>
  );
}
