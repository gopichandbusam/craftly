// Security headers and CSP configuration

export const getSecurityHeaders = () => {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.googleapis.com https://*.google-analytics.com https://*.firebaseio.com https://*.firebase.googleapis.com wss://*.firebaseio.com",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; '),
    
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'payment=()',
      'usb=()',
      'bluetooth=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()'
    ].join(', ')
  };
};

// Security monitoring
export const reportSecurityIssue = (issue: {
  type: 'csp_violation' | 'xss_attempt' | 'suspicious_activity';
  details: string;
  userAgent?: string;
  timestamp?: number;
}) => {
  console.warn('🔒 Security Issue Detected:', issue);
  
  // In production, send to security monitoring service
  if (import.meta.env.PROD) {
    // Send to logging service
    fetch('/api/security-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...issue,
        timestamp: issue.timestamp || Date.now(),
        userAgent: issue.userAgent || navigator.userAgent,
        url: window.location.href
      })
    }).catch(error => {
      console.error('Failed to report security issue:', error);
    });
  }
};

// CSP violation handler
export const setupCSPReporting = () => {
  document.addEventListener('securitypolicyviolation', (e) => {
    reportSecurityIssue({
      type: 'csp_violation',
      details: `CSP Violation: ${e.violatedDirective} - ${e.blockedURI}`
    });
  });
};

// XSS detection
export const detectXSS = (input: string): boolean => {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi,
    /<link[^>]*>/gi,
    /<meta[^>]*>/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};

// Initialize security measures
export const initializeSecurity = () => {
  setupCSPReporting();
  
  // Prevent right-click context menu in production
  if (import.meta.env.PROD) {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
    
    // Prevent F12 developer tools
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'J') ||
          (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
      }
    });
  }
  
  // Console warning
  console.log(
    '%cStop!',
    'color: red; font-size: 50px; font-weight: bold;'
  );
  console.log(
    '%cThis is a browser feature intended for developers. If someone told you to copy-paste something here to enable a feature or "hack" someone\'s account, it is a scam and will give them access to your account.',
    'color: red; font-size: 16px;'
  );
};