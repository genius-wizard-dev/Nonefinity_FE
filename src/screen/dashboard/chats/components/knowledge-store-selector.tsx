import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { KnowledgeStore } from "../../knowledge-stores/types";
import React from "react";

interface KnowledgeStoreSelectorProps {
  value: string | null;
  onChange: (value: string | null) => void;
  stores: KnowledgeStore[];
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  selectedEmbeddingModel?: { dimension?: number } | null;
}

export const KnowledgeStoreSelector: React.FC<
  KnowledgeStoreSelectorProps
> = ({
  value,
  onChange,
  stores,
  loading = false,
  disabled = false,
  placeholder = "Select knowledge store (optional)",
  id,
  selectedEmbeddingModel,
}) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Knowledge Store (Optional)</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const filteredStores = stores.filter(
    (store) =>
      !selectedEmbeddingModel?.dimension ||
      store.dimension === selectedEmbeddingModel.dimension
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Knowledge Store (Optional)</Label>
      <Select
        value={value || "__none__"}
        onValueChange={(val) => onChange(val === "__none__" ? null : val)}
        disabled={disabled}
      >
        <SelectTrigger id={id}>
          <SelectValue
            placeholder={
              disabled
                ? "Select embedding model first"
                : placeholder
            }
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">None</SelectItem>
          {filteredStores.length === 0 ? (
            <SelectItem value="__no_stores__" disabled>
              {selectedEmbeddingModel
                ? `No stores with dimension ${selectedEmbeddingModel.dimension}`
                : "Select embedding model first"}
            </SelectItem>
          ) : (
            filteredStores.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                {store.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

