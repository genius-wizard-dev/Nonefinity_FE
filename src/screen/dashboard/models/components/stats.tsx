import type { ModelStats as Stats } from "../type";

interface ModelStatsProps {
  stats: Stats | null;
}

export function ModelStats({ stats }: ModelStatsProps) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="bg-card shadow-sm rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Total Models</p>
        <p className="text-2xl font-semibold mt-1">{stats.total_models}</p>
      </div>
      <div className="bg-card shadow-sm rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Chat Models</p>
        <p className="text-2xl font-semibold mt-1">{stats.chat_models}</p>
      </div>
      <div className="bg-card shadow-sm rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Embedding Models</p>
        <p className="text-2xl font-semibold mt-1">{stats.embedding_models}</p>
      </div>
      <div className="bg-card shadow-sm rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Active</p>
        <p className="text-2xl font-semibold mt-1 text-green-600">
          {stats.active_models}
        </p>
      </div>
      <div className="bg-card shadow-sm rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Inactive</p>
        <p className="text-2xl font-semibold mt-1 text-red-600">
          {stats.inactive_models}
        </p>
      </div>
    </div>
  );
}
