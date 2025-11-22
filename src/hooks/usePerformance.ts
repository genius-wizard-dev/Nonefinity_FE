import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  apiCallCount: number;
  cacheHitRate: number;
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    apiCallCount: 0,
    cacheHitRate: 0,
  });

  const startTime = useRef<number>(Date.now());
  const renderStart = useRef<number>(0);
  const apiCalls = useRef<number>(0);
  const cacheHits = useRef<number>(0);

  // Track render performance
  const startRender = () => {
    renderStart.current = performance.now();
  };

  const endRender = () => {
    if (renderStart.current > 0) {
      const renderTime = performance.now() - renderStart.current;
      setMetrics(prev => ({ ...prev, renderTime }));
    }
  };

  // Track API calls
  const trackApiCall = (isCacheHit: boolean = false) => {
    apiCalls.current += 1;
    if (isCacheHit) {
      cacheHits.current += 1;
    }

    const cacheHitRate = apiCalls.current > 0
      ? (cacheHits.current / apiCalls.current) * 100
      : 0;

    setMetrics(prev => ({
      ...prev,
      apiCallCount: apiCalls.current,
      cacheHitRate,
    }));
  };

  // Track overall load time
  useEffect(() => {
    const loadTime = Date.now() - startTime.current;
    setMetrics(prev => ({ ...prev, loadTime }));
  }, []);

  // Performance optimization suggestions
  const getOptimizationSuggestions = (): string[] => {
    const suggestions: string[] = [];

    if (metrics.renderTime > 16) {
      suggestions.push('Consider optimizing component rendering (target: <16ms)');
    }

    if (metrics.apiCallCount > 10) {
      suggestions.push('Consider batching API calls to reduce network requests');
    }

    if (metrics.cacheHitRate < 50) {
      suggestions.push('Consider improving caching strategy');
    }

    if (metrics.loadTime > 3000) {
      suggestions.push('Consider implementing lazy loading for heavy components');
    }

    return suggestions;
  };

  return {
    metrics,
    startRender,
    endRender,
    trackApiCall,
    getOptimizationSuggestions,
  };
}

// Hook for monitoring component performance
export function useComponentPerformance() {
  const { startRender, endRender, trackApiCall } = usePerformance();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    startRender();
    return () => {
      endRender();
    };
  }, []);

  const trackLoading = (loading: boolean) => {
    setIsLoading(loading);
    if (!loading) {
      endRender();
    }
  };

  return {
    isLoading,
    trackLoading,
    trackApiCall,
  };
}



