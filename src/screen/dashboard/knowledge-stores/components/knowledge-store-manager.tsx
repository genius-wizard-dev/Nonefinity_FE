import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  AlertCircle,
  Database,
  Layers,
  Plus,
  Search,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  useError,
  useFetchKnowledgeStores,
  useKnowledgeStores,
  useLoading,
} from "../store";
import type { KnowledgeStore } from "../types";
import { CreateKnowledgeDataDialog } from "./create-knowledge-data-dialog";
import { CreateKnowledgeStoreDialog } from "./create-knowledge-store-dialog";
import { DeleteKnowledgeStoreDialog } from "./delete-knowledge-store-dialog";
import { EditKnowledgeStoreDialog } from "./edit-knowledge-store-dialog";
import { KnowledgeStoreCard } from "./knowledge-store-card";
export function KnowledgeStoreManager() {
  // Use selectors to prevent unnecessary re-renders
  const knowledgeStores = useKnowledgeStores();
  const loading = useLoading();
  const error = useError();
  const fetchKnowledgeStores = useFetchKnowledgeStores();
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKnowledgeStore, setSelectedKnowledgeStore] =
    useState<KnowledgeStore | null>(null);
  const [createDataDialogOpen, setCreateDataDialogOpen] = useState(false);

  // Fetch knowledge stores on component mount
  useEffect(() => {
    fetchKnowledgeStores();
  }, [fetchKnowledgeStores]);

  // Filter knowledge stores based on search query
  const filteredKnowledgeStores = knowledgeStores.filter(
    (store) =>
      store.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStores = knowledgeStores.length;
  const activeStores = knowledgeStores.filter(
    (store) => store.status === "green"
  ).length;

  // Calculate total vectors from all knowledge stores
  const totalVectors = knowledgeStores.reduce((sum, store) => {
    // Assuming each knowledge store has a points_count or vectors_count
    return sum + (store.points_count || 0);
  }, 0);

  // Calculate average dimensions
  const avgDimensions =
    knowledgeStores.length > 0
      ? Math.round(
          knowledgeStores.reduce(
            (sum, store) => sum + (store.dimension || 0),
            0
          ) / knowledgeStores.length
        )
      : 0;

  // Handle edit knowledge store
  const handleEdit = (knowledgeStore: KnowledgeStore) => {
    setSelectedKnowledgeStore(knowledgeStore);
    setEditDialogOpen(true);
  };

  // Handle delete knowledge store
  const handleDelete = (knowledgeStore: KnowledgeStore) => {
    setSelectedKnowledgeStore(knowledgeStore);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Knowledge Stores
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your vector knowledge stores
                </p>
              </div>
            </div>
            <Button size="sm" onClick={() => setCreateDataDialogOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Create Data
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardDescription className="text-muted-foreground">
                Total Vectors
              </CardDescription>
              <CardTitle className="text-3xl font-mono text-foreground">
                {totalVectors.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="w-3 h-3" />
                <span>Across all collections</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardDescription className="text-muted-foreground">
                Collections
              </CardDescription>
              <CardTitle className="text-3xl font-mono text-foreground">
                {totalStores}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Layers className="w-3 h-3" />
                <span>{activeStores} active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardDescription className="text-muted-foreground">
                Avg Dimensions
              </CardDescription>
              <CardTitle className="text-3xl font-mono text-foreground">
                {avgDimensions}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Database className="w-3 h-3" />
                <span>Vector size</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex items-stretch gap-4 mb-6">
          <div className="relative flex-1 max-w-md flex items-stretch">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search knowledge stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border border-border text-foreground h-full"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="flex items-stretch">
            <Button
              size="sm"
              className="h-full"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Knowledge Store
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && knowledgeStores.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Knowledge Stores
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first knowledge store to start managing your vector
              data.
            </p>
          </div>
        )}

        {/* Knowledge Stores Grid */}
        {!loading && !error && filteredKnowledgeStores.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredKnowledgeStores.map((knowledgeStore) => (
              <KnowledgeStoreCard
                key={knowledgeStore.id}
                knowledgeStore={knowledgeStore}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading &&
          !error &&
          knowledgeStores.length > 0 &&
          filteredKnowledgeStores.length === 0 && (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No matching knowledge stores
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or create a new knowledge store.
              </p>
            </div>
          )}
      </div>

      <CreateKnowledgeStoreDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <EditKnowledgeStoreDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        knowledgeStore={selectedKnowledgeStore}
      />

      <DeleteKnowledgeStoreDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        knowledgeStore={selectedKnowledgeStore}
      />
      <CreateKnowledgeDataDialog
        open={createDataDialogOpen}
        onOpenChange={setCreateDataDialogOpen}
      />
    </div>
  );
}
