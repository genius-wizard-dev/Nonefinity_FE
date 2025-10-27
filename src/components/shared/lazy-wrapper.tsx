import { Suspense, lazy, ComponentType } from "react";
import { EnhancedSkeleton } from "./enhanced-skeleton";

interface LazyWrapperProps {
  fallback?: React.ReactNode;
  className?: string;
}

// Generic lazy wrapper for any component
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyWrapper(props: React.ComponentProps<T> & LazyWrapperProps) {
    return (
      <Suspense fallback={fallback || <EnhancedSkeleton className="w-full h-32" />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Pre-configured lazy components for common patterns
export const LazyFileGrid = createLazyComponent(
  () => import("../../screen/dashboard/file-management/components/file-grid"),
  <EnhancedSkeleton className="w-full h-64" />
);

export const LazyChatList = createLazyComponent(
  () => import("../../screen/dashboard/chats/components/chat-list"),
  <EnhancedSkeleton className="w-full h-48" />
);

export const LazyDatasetTable = createLazyComponent(
  () => import("../../screen/dashboard/dataset-management/components/dataset-list"),
  <EnhancedSkeleton className="w-full h-64" />
);

// Hook for progressive loading
export function useProgressiveLoading() {
  const loadCriticalData = async () => {
    // Load most important data first
    return Promise.resolve();
  };

  const loadSecondaryData = async () => {
    // Load secondary data after critical data
    return Promise.resolve();
  };

  const loadBackgroundData = async () => {
    // Load background data (stats, analytics, etc.)
    return Promise.resolve();
  };

  return {
    loadCriticalData,
    loadSecondaryData,
    loadBackgroundData,
  };
}
