import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { KnowledgeStoreDetail } from "./components";
import { useKnowledgeStoreStore } from "./store";

const KnowledgeStoreDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { knowledgeStores, loading, error, fetchKnowledgeStores } =
    useKnowledgeStoreStore();

  // Find the specific knowledge store
  const knowledgeStore = id
    ? knowledgeStores.find((ks) => ks.id === id) || null
    : null;

  // Fetch knowledge stores if not loaded
  useEffect(() => {
    if (knowledgeStores.length === 0 && !loading) {
      fetchKnowledgeStores();
    }
  }, [knowledgeStores.length, loading, fetchKnowledgeStores]);

  return (
    <KnowledgeStoreDetail
      knowledgeStore={knowledgeStore}
      loading={loading}
      error={error}
    />
  );
};

export default KnowledgeStoreDetailPage;
