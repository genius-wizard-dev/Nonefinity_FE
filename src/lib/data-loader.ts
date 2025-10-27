import { useAuth } from "@clerk/clerk-react";

// Data loading utilities for performance optimization
export class DataLoader {
  private static instance: DataLoader;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private pendingRequests = new Map<string, Promise<any>>();

  static getInstance(): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader();
    }
    return DataLoader.instance;
  }

  // Batch multiple API calls into a single request
  async batchRequests<T>(
    requests: Array<{ key: string; fn: () => Promise<T> }>,
    ttl: number = 30000
  ): Promise<Record<string, T>> {
    const results: Record<string, T> = {};
    const uncachedRequests: Array<{ key: string; fn: () => Promise<T> }> = [];

    // Check cache first
    for (const request of requests) {
      const cached = this.getFromCache(request.key);
      if (cached) {
        results[request.key] = cached;
      } else {
        uncachedRequests.push(request);
      }
    }

    // Execute uncached requests in parallel
    if (uncachedRequests.length > 0) {
      const promises = uncachedRequests.map(async (request) => {
        try {
          const data = await request.fn();
          this.setCache(request.key, data, ttl);
          return { key: request.key, data };
        } catch (error) {
          console.error(`Error loading ${request.key}:`, error);
          return { key: request.key, data: null, error };
        }
      });

      const batchResults = await Promise.allSettled(promises);
      
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results[result.value.key] = result.value.data;
        }
      });
    }

    return results;
  }

  // Deduplicate requests - if same request is already pending, return the existing promise
  async deduplicateRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl: number = 30000
  ): Promise<T> {
    // Check cache first
    const cached = this.getFromCache(key);
    if (cached) {
      return cached;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Create new request
    const requestPromise = requestFn().then((data) => {
      this.setCache(key, data, ttl);
      this.pendingRequests.delete(key);
      return data;
    }).catch((error) => {
      this.pendingRequests.delete(key);
      throw error;
    });

    this.pendingRequests.set(key, requestPromise);
    return requestPromise;
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  // Clear cache for specific keys or all
  clearCache(keys?: string[]): void {
    if (keys) {
      keys.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  // Preload data for likely next screens
  async preloadDashboardData(): Promise<void> {
    try {
      // Preload common dashboard data in background
      const preloadPromises = [
        // Add your preload functions here
        // Example: this.deduplicateRequest('files-summary', () => FileService.getFilesSummary()),
        // Example: this.deduplicateRequest('models-summary', () => ModelService.getModelsSummary()),
      ];

      // Don't wait for preload to complete
      Promise.allSettled(preloadPromises);
    } catch (error) {
      console.warn('Preload failed:', error);
    }
  }
}

// Hook for optimized data loading
export function useOptimizedDataLoader() {
  const { getToken } = useAuth();
  const loader = DataLoader.getInstance();

  const loadDashboardData = async () => {
    const token = await getToken();
    if (!token) return {};

    // Batch all dashboard data requests
    const requests = [
      {
        key: 'files',
        fn: async () => {
          // Import dynamically to avoid circular dependencies
          const { FileService } = await import('../screen/dashboard/file-management/services');
          return FileService.getFiles(token);
        }
      },
      {
        key: 'files-stats',
        fn: async () => {
          const { FileService } = await import('../screen/dashboard/file-management/services');
          return FileService.getStats(token);
        }
      },
      {
        key: 'datasets',
        fn: async () => {
          const { DatasetService } = await import('../screen/dashboard/dataset-management/services');
          return DatasetService.getDatasets(1, 10, token);
        }
      },
      {
        key: 'models',
        fn: async () => {
          const { ModelService } = await import('../screen/dashboard/models/service');
          return ModelService.listModels({ skip: 0, limit: 10 });
        }
      },
      {
        key: 'knowledge-stores',
        fn: async () => {
          const { KnowledgeStoreService } = await import('../screen/dashboard/knowledge-stores/services');
          return KnowledgeStoreService.list({ skip: 0, limit: 10 }, {});
        }
      }
    ];

    return loader.batchRequests(requests, 30000); // 30 second TTL
  };

  return {
    loadDashboardData,
    loader,
  };
}
