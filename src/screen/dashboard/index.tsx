import LogoIcon from "@/assets/Nonefinity_Dark.png";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import {
  Brain,
  Database,
  FileText,
  Key,
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import "react";
import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
export function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  const navigationItems = [
    {
      name: "General",
      href: "/dashboard/general",
      icon: LayoutDashboard,
    },
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
      name: "Credentials",
      href: "/dashboard/credentials",
      icon: Key,
    },
    {
      name: "Models",
      href: "/dashboard/models",
      icon: Brain,
    },
    {
      name: "Embedding",
      href: "/dashboard/embedding",
      icon: Sparkles,
    },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
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
            <img src={LogoIcon} alt="Logo" className="w-5 h-5 flex-shrink-0" />
            <span className="text-lg font-semibold text-foreground whitespace-nowrap">
              Nonefinity
            </span>
          </div>
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

        <SignedIn>
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
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
            <div className="h-16 flex items-center gap-2 px-6 border-b flex-shrink-0">
              <img
                src={LogoIcon}
                alt="Logo"
                className="w-5 h-5 flex-shrink-0"
              />
              <span className="text-lg font-semibold text-foreground">
                Nonefinity
              </span>
            </div>

            <SignedIn>
              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navigationItems.map((item) => {
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
