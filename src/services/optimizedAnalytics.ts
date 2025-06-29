// Optimized analytics without Firebase - uses local storage and console logging
// In production, you can integrate with your preferred analytics service

interface AnalyticsEvent {
  event: string;
  params: any;
  timestamp: string;
}

// Throttle analytics events to reduce overhead
const eventThrottle = new Map<string, number>();
const THROTTLE_DURATION = 5000; // 5 seconds

class AnalyticsOptimizer {
  private static eventQueue: AnalyticsEvent[] = [];
  private static flushTimeout: NodeJS.Timeout | null = null;

  static trackEvent(event: string, params: any = {}) {
    const now = Date.now();
    const eventKey = `${event}_${JSON.stringify(params)}`;
    
    // Throttle duplicate events
    const lastTime = eventThrottle.get(eventKey);
    if (lastTime && now - lastTime < THROTTLE_DURATION) {
      return;
    }
    
    eventThrottle.set(eventKey, now);
    
    // Queue the event
    this.eventQueue.push({ 
      event, 
      params, 
      timestamp: new Date().toISOString() 
    });
    
    // Batch events
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }
    
    this.flushTimeout = setTimeout(() => {
      this.flushEvents();
    }, 1000);
  }

  private static flushEvents() {
    if (this.eventQueue.length === 0) return;
    
    const events = [...this.eventQueue];
    this.eventQueue = [];
    
    console.log(`📊 Analytics Events (${events.length}):`, events);
    
    // Store events in localStorage for potential later use
    try {
      const existingEvents = JSON.parse(localStorage.getItem('craftly_analytics') || '[]');
      const allEvents = [...existingEvents, ...events].slice(-100); // Keep last 100 events
      localStorage.setItem('craftly_analytics', JSON.stringify(allEvents));
    } catch (error) {
      console.warn('Failed to store analytics events:', error);
    }

    // In production, send events to your analytics service here
    // Example:
    // await fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(events)
    // });
  }
}

// Simplified tracking functions
export const trackUserAction = (action: string, details?: any) => {
  AnalyticsOptimizer.trackEvent('user_action', { action, ...details });
};

export const trackError = (error: string, location: string) => {
  AnalyticsOptimizer.trackEvent('app_error', { 
    error: error.substring(0, 100), // Limit error message length
    location 
  });
};

export const trackPerformance = (action: string, duration: number, success: boolean) => {
  AnalyticsOptimizer.trackEvent('performance', { action, duration, success });
};

export const trackFeatureUsage = (feature: string) => {
  AnalyticsOptimizer.trackEvent('feature_usage', { feature });
};

// User authentication tracking functions
export const trackUserSignup = (method: string, userData: any) => {
  AnalyticsOptimizer.trackEvent('user_signup', { method, success: true });
};

export const trackUserLogin = (method: string, userData: any) => {
  AnalyticsOptimizer.trackEvent('user_login', { method, success: true });
};

export const trackUserLogout = () => {
  AnalyticsOptimizer.trackEvent('user_logout', {});
};

export const trackUserSessionStart = () => {
  AnalyticsOptimizer.trackEvent('session_start', {});
};

export const trackUserSessionEnd = (duration?: number) => {
  AnalyticsOptimizer.trackEvent('session_end', { duration });
};

// Combined tracking for related events
export const trackResumeFlow = (stage: 'upload' | 'process' | 'edit' | 'save', data?: any) => {
  AnalyticsOptimizer.trackEvent('resume_flow', { stage, ...data });
};

export const trackCoverLetterFlow = (stage: 'generate' | 'edit' | 'download', data?: any) => {
  AnalyticsOptimizer.trackEvent('cover_letter_flow', { stage, ...data });
};