import React from "react";
import { KnowledgeStoreManager } from "./knowledge-store-manager";

interface KnowledgeStoreListProps {
  knowledgeStores: any[];
  loading: boolean;
  error: string | null;
  onCreateNew: () => void;
  onEdit: (knowledgeStore: any) => void;
  onDelete: (knowledgeStore: any) => void;
}

export const KnowledgeStoreList: React.FC<KnowledgeStoreListProps> = () => {
  return <KnowledgeStoreManager />;
};
