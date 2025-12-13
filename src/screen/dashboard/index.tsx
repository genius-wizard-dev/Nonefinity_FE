import { ThemeToggle } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import {
  BookOpen,
  Brain,
  Database,
  FileText,
  Key,
  KeyRound,
  LayoutDashboard,
  Link as LinkIcon,
  ListTodo,
  Menu,
  MessageSquare,
  Server,
  X,
} from "lucide-react";
import "react";
import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
export function Layout() {
  const location = useLocation();
  const { theme } = useTheme();
  const { user } = useUser();
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
          name: "API Keys",
          href: "/dashboard/api-keys",
          icon: KeyRound,
        },
        {
          name: "Tasks",
          href: "/dashboard/embeddings",
          icon: ListTodo,
        },
        {
          name: "Integrate",
          href: "/dashboard/integrate",
          icon: LinkIcon,
        },
        {
          name: "MCP",
          href: "/dashboard/mcp",
          icon: Server,
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    // Check if current path matches or starts with the href (for nested routes)
    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
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
            "h-16 flex items-center px-4 border-b flex-shrink-0",
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
          <nav
            className="flex-1 p-4 space-y-3 overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(128, 128, 128, 0.3) transparent",
            }}
          >
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
        </SignedIn>
      </aside>

      {/* Header Bar */}
      <SignedIn>
        <header
          className={cn(
            "fixed top-0 left-0 right-0 h-16 z-50 bg-background/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0 transition-all duration-300 ease-in-out",
            sidebarOpen ? "lg:left-64" : "lg:left-20"
          )}
        >
          {/* Left Side - Menu Button (Mobile) & User Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-9 w-9 flex-shrink-0 hover:bg-accent transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                showCloseButton={false}
                className="w-[280px] sm:w-64 p-0 max-w-[85vw]"
              >
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="h-14 sm:h-16 flex items-center justify-between px-2 sm:px-4 border-b flex-shrink-0 gap-1.5 sm:gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                      <img
                        src={currentLogo}
                        alt="Logo"
                        className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                      />
                      <span className="text-sm sm:text-base lg:text-lg font-semibold text-foreground truncate hidden sm:inline">
                        Nonefinity
                      </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 sm:h-9 sm:w-9"
                          aria-label="Close menu"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </SheetClose>
                    </div>
                  </div>

                  <SignedIn>
                    {/* Navigation */}
                    <nav className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto">
                      {navigationGroups.map((group, groupIndex) => (
                        <div key={groupIndex} className="space-y-1">
                          {group.label && (
                            <div className="px-2 sm:px-3 py-1.5 sm:py-2">
                              <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                                  className="w-full justify-start h-10 sm:h-11 text-sm"
                                >
                                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                  <span className="font-medium ml-2 sm:ml-3 truncate">
                                    {item.name}
                                  </span>
                                </Button>
                              </Link>
                            );
                          })}
                        </div>
                      ))}
                    </nav>
                  </SignedIn>
                </div>
              </SheetContent>
            </Sheet>

            {/* User Info */}
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Manage your data
              </p>
            </div>
          </div>

          {/* UserButton - Right Side */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <ThemeToggle />
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-9 h-9 sm:w-10 sm:h-10",
                  userButtonPopoverCard: "z-[100]",
                },
              }}
            />
          </div>
        </header>
      </SignedIn>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden pt-16">
          <SignedOut>
            <Navigate to="/sign-in" replace />
          </SignedOut>
          <SignedIn>
            <div className="flex-1 min-h-0 overflow-hidden">
              <Outlet />
            </div>
          </SignedIn>
        </main>
      </div>
    </div>
  );
}
