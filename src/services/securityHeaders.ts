// Security headers and CSP configuration - Updated to allow right-click

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

// Initialize security measures - UPDATED to allow right-click
export const initializeSecurity = () => {
  setupCSPReporting();
  
  // ✅ RIGHT-CLICK IS NOW ENABLED - Removed context menu prevention
  console.log('🔓 Right-click context menu is enabled for inspection');
  
  // ✅ DEVELOPER TOOLS ARE NOW ENABLED - Removed F12 prevention
  console.log('🔓 Developer tools are enabled for debugging');
  
  // Console security warning (still important)
  console.log(
    '%cDeveloper Mode Enabled',
    'color: green; font-size: 20px; font-weight: bold;'
  );
  console.log(
    '%cRight-click and developer tools are enabled for inspection and debugging. Be cautious about running unknown code.',
    'color: orange; font-size: 14px;'
  );
  
  // Add development mode indicator
  if (import.meta.env.DEV) {
    const indicator = document.createElement('div');
    indicator.innerHTML = '🔧 Development Mode';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: #10b981;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 9999;
      font-family: monospace;
    `;
    document.body.appendChild(indicator);
  }
};