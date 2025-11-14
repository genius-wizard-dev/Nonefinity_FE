import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Database, Search } from "lucide-react";
import { useState } from "react";
import { useKnowledgeStoreStore } from "../store";
import type { KnowledgeStore } from "../types";

interface KnowledgeStoreSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KnowledgeStoreSearchDialog({
  open,
  onOpenChange,
}: KnowledgeStoreSearchDialogProps) {
  const { knowledgeStores } = useKnowledgeStoreStore();
  const [query, setQuery] = useState("");
  // const [selectedStore, setSelectedStore] = useState<string>("");
  const [results, setResults] = useState<KnowledgeStore[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // Filter knowledge stores based on search query
      const filtered = knowledgeStores.filter(
        (store) =>
          store.name.toLowerCase().includes(query.toLowerCase()) ||
          store.description?.toLowerCase().includes(query.toLowerCase()) ||
          store.collection_name.toLowerCase().includes(query.toLowerCase())
      );

      setResults(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-popover border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Search Knowledge Stores
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Find knowledge stores by name, description, or collection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="query" className="text-foreground">
              Search Query
            </Label>
            <div className="flex gap-2">
              <Input
                id="query"
                placeholder="Search by name, description, or collection..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-card border-border text-foreground"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !query.trim()}
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {results.length > 0 && (
            <div className="space-y-2 mt-6">
              <Label className="text-foreground">
                Search Results ({results.length})
              </Label>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.map((store) => (
                  <div
                    key={store.id}
                    className="p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">
                          {store.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {store.description || "No description provided"}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`ml-2 ${
                          store.status === "green"
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : store.status === "yellow"
                            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                        }`}
                      >
                        {store.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Database className="w-3 h-3" />
                        {store.dimension}D
                      </span>
                      <span>•</span>
                      <span>{store.distance}</span>
                      <span>•</span>
                      <span className="font-mono">{store.collection_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.length === 0 && query && !isSearching && (
            <div className="text-center py-8">
              <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No knowledge stores found matching your search
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
