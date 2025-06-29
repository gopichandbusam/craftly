import { useEffect } from 'react';
import { trackPerformance } from '../services/analytics';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              trackPerformance({
                action: 'first_contentful_paint',
                duration: entry.startTime,
                success: true,
                additionalData: { metric: 'fcp' }
              });
            }
            break;
            
          case 'largest-contentful-paint':
            trackPerformance({
              action: 'largest_contentful_paint',
              duration: entry.startTime,
              success: true,
              additionalData: { metric: 'lcp' }
            });
            break;
            
          case 'first-input':
            trackPerformance({
              action: 'first_input_delay',
              duration: (entry as any).processingStart - entry.startTime,
              success: true,
              additionalData: { metric: 'fid' }
            });
            break;
            
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              trackPerformance({
                action: 'cumulative_layout_shift',
                duration: (entry as any).value,
                success: true,
                additionalData: { metric: 'cls' }
              });
            }
            break;
        }
      }
    });

    // Observe different entry types
    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }

    // Monitor resource loading
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;
        
        if (resource.duration > 1000) { // Track slow resources
          trackPerformance({
            action: 'slow_resource_load',
            duration: resource.duration,
            success: false,
            additionalData: {
              resource_name: resource.name,
              resource_type: resource.initiatorType,
              transfer_size: resource.transferSize
            }
          });
        }
      }
    });

    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Resource Observer not supported:', error);
    }

    // Monitor navigation timing
    const navigationObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const nav = entry as PerformanceNavigationTiming;
        
        trackPerformance({
          action: 'page_load',
          duration: nav.loadEventEnd - nav.navigationStart,
          success: true,
          additionalData: {
            dom_content_loaded: nav.domContentLoadedEventEnd - nav.navigationStart,
            time_to_first_byte: nav.responseStart - nav.navigationStart,
            dns_lookup: nav.domainLookupEnd - nav.domainLookupStart,
            tcp_connection: nav.connectEnd - nav.connectStart
          }
        });
      }
    });

    try {
      navigationObserver.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      console.warn('Navigation Observer not supported:', error);
    }

    return () => {
      observer.disconnect();
      resourceObserver.disconnect();
      navigationObserver.disconnect();
    };
  }, []);

  // Memory usage monitoring
  useEffect(() => {
    const checkMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
          trackPerformance({
            action: 'high_memory_usage',
            duration: memory.usedJSHeapSize,
            success: false,
            additionalData: {
              used_heap_size: memory.usedJSHeapSize,
              total_heap_size: memory.totalJSHeapSize,
              heap_size_limit: memory.jsHeapSizeLimit
            }
          });
        }
      }
    };

    const interval = setInterval(checkMemoryUsage, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);
};