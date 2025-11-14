import {
  BookOpen,
  Brain,
  Database,
  FileText,
  Key,
  MessageSquare,
  Zap,
} from "lucide-react";
import { QuickAccessCard } from "./QuickAccessCard";

export function QuickAccessGrid() {
  const quickAccessItems = [
    {
      to: "/dashboard/chats",
      icon: <MessageSquare className="w-full h-full" />,
      title: "Chats",
      description: "Start conversations and interact with your AI assistant",
      gradient: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
    },
    {
      to: "/dashboard/files",
      icon: <FileText className="w-full h-full" />,
      title: "Files",
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
      to: "/dashboard/knowledge-stores",
      icon: <BookOpen className="w-full h-full" />,
      title: "Knowledge Stores",
      description: "Manage your knowledge base and storage systems",
      gradient: "bg-gradient-to-br from-indigo-500/10 to-violet-500/10",
    },
    {
      to: "/dashboard/models",
      icon: <Brain className="w-full h-full" />,
      title: "Models",
      description: "Configure and manage AI models for your applications",
      gradient: "bg-gradient-to-br from-orange-500/10 to-red-500/10",
    },
    {
      to: "/dashboard/embeddings",
      icon: <Zap className="w-full h-full" />,
      title: "Embedding",
      description: "Configure AI models and embedding services",
      gradient: "bg-gradient-to-br from-yellow-500/10 to-amber-500/10",
    },
    {
      to: "/dashboard/credentials",
      icon: <Key className="w-full h-full" />,
      title: "Credentials",
      description: "Manage API keys and authentication credentials",
      gradient: "bg-gradient-to-br from-teal-500/10 to-cyan-500/10",
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
