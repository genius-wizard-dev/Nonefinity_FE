import { Brain, Database, FileText, Settings, User, Zap } from "lucide-react";
import { QuickAccessCard } from "./QuickAccessCard";

export function QuickAccessGrid() {
  const quickAccessItems = [
    {
      to: "/dashboard/profile",
      icon: <User className="w-full h-full" />,
      title: "User Profile",
      description: "Manage your account settings and preferences",
      gradient: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
    },
    {
      to: "/dashboard/files",
      icon: <FileText className="w-full h-full" />,
      title: "File Management",
      description: "Upload, search, and organize your files efficiently",
      gradient: "bg-gradient-to-br from-green-500/10 to-emerald-500/10",
    },
    {
      to: "/dashboard/datasets",
      icon: <Database className="w-full h-full" />,
      title: "Datasets",
      description: "Create and manage your knowledge datasets",
      gradient: "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
    },
    {
      to: "/dashboard/embeddings",
      icon: <Brain className="w-full h-full" />,
      title: "Embeddings",
      description: "Configure AI models and embedding services",
      gradient: "bg-gradient-to-br from-orange-500/10 to-red-500/10",
    },
    {
      to: "/dashboard/automation",
      icon: <Zap className="w-full h-full" />,
      title: "Automation",
      description: "Set up workflows and automated tasks",
      gradient: "bg-gradient-to-br from-yellow-500/10 to-amber-500/10",
    },
    {
      to: "/dashboard/settings",
      icon: <Settings className="w-full h-full" />,
      title: "Settings",
      description: "Customize your workspace and integrations",
      gradient: "bg-gradient-to-br from-slate-500/10 to-gray-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Quick Access</h2>
        <p className="text-muted-foreground">
          Navigate to your most used features
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickAccessItems.map((item) => (
          <QuickAccessCard key={item.to} {...item} />
        ))}
      </div>
    </div>
  );
}
