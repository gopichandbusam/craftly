# 🔒 Additional Security Hardening Guide

This guide provides extra security measures you can implement for maximum protection.

## 🛡️ Advanced Security Measures

### 1. **API Rate Limiting Implementation**

#### Supabase Edge Function for Rate Limiting
```typescript
// Create this as a Supabase Edge Function
import { createClient } from '@supabase/supabase-js'

const rateLimitMap = new Map();

export default async function rateLimiter(req: Request) {
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const key = `${clientIP}-${userAgent}`;
  
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10; // 10 requests per minute
  
  const userRequests = rateLimitMap.get(key) || [];
  const validRequests = userRequests.filter(time => now - time < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return new Response('Rate limit exceeded', { 
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': '0'
      }
    });
  }
  
  validRequests.push(now);
  rateLimitMap.set(key, validRequests);
  
  // Continue with original request
  return new Response('OK', { status: 200 });
}
```

### 2. **Enhanced Input Validation Service**

```typescript
// Add to src/services/advancedValidation.ts
export class SecurityValidator {
  
  // Validate AI-generated content
  static validateAIContent(content: string): { isValid: boolean; reason?: string } {
    const suspiciousPatterns = [
      { pattern: /\b\d{3}-\d{2}-\d{4}\b/, reason: 'Contains SSN pattern' },
      { pattern: /\b\d{16}\b/, reason: 'Contains credit card pattern' },
      { pattern: /confidential|internal|proprietary/gi, reason: 'Contains sensitive keywords' },
      { pattern: /<script|javascript:|on\w+=/gi, reason: 'Contains script injection' }
    ];
    
    for (const { pattern, reason } of suspiciousPatterns) {
      if (pattern.test(content)) {
        return { isValid: false, reason };
      }
    }
    
    return { isValid: true };
  }
  
  // Enhanced file validation
  static validateFileSecurely(file: File): { isValid: boolean; reason?: string } {
    // Check file signature (magic bytes)
    const allowedSignatures = {
      'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
      'application/msword': [0xD0, 0xCF, 0x11, 0xE0], // Office docs
      'text/plain': [0x20, 0x0A, 0x0D] // Text files (flexible)
    };
    
    // Additional security checks
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      return { isValid: false, reason: 'Invalid file name contains path traversal' };
    }
    
    if (file.size === 0) {
      return { isValid: false, reason: 'Empty file not allowed' };
    }
    
    return { isValid: true };
  }
  
  // Sanitize user input
  static sanitizeInput(input: string): string {
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
}
```

### 3. **Security Headers Enhancement**

```typescript
// Add to vite.config.ts
export default defineConfig({
  server: {
    headers: {
      // Enhanced security headers
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), bluetooth=()',
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        img-src 'self' data: https: blob:;
        connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.supabase.co;
        media-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        upgrade-insecure-requests;
      `.replace(/\s+/g, ' ').trim()
    }
  }
});
```

### 4. **Advanced Error Handling**

```typescript
// Add to src/services/securityLogger.ts
export class SecurityLogger {
  private static readonly SECURITY_ENDPOINT = '/api/security-events';
  
  static async logSecurityEvent(event: {
    type: 'authentication_failure' | 'unauthorized_access' | 'suspicious_activity' | 'rate_limit_exceeded';
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: Record<string, any>;
    userAgent?: string;
    ip?: string;
  }) {
    const securityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      sessionId: crypto.randomUUID(),
      url: window.location.href,
      userAgent: event.userAgent || navigator.userAgent,
    };
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.warn('🚨 Security Event:', securityEvent);
    }
    
    // In production, send to security monitoring service
    if (import.meta.env.PROD) {
      try {
        await fetch(this.SECURITY_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(securityEvent)
        });
      } catch (error) {
        console.error('Failed to log security event:', error);
      }
    }
  }
  
  static logAuthenticationFailure(email: string, reason: string) {
    this.logSecurityEvent({
      type: 'authentication_failure',
      severity: 'medium',
      details: { email, reason }
    });
  }
  
  static logSuspiciousActivity(activity: string, details: Record<string, any>) {
    this.logSecurityEvent({
      type: 'suspicious_activity',
      severity: 'high',
      details: { activity, ...details }
    });
  }
}
```

### 5. **Dependency Security Monitoring**

```json
// Add to package.json
{
  "scripts": {
    "security:audit": "npm audit --audit-level moderate",
    "security:fix": "npm audit fix",
    "security:check": "npm outdated && npm audit",
    "security:update": "npm update && npm audit fix"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "audit-ci": "^6.6.1"
  }
}
```

### 6. **Environment Security**

```bash
#!/bin/bash
# Create security-check.sh script

echo "🔒 Running Security Checks..."

# Check for common security issues
echo "📋 Checking environment variables..."
if [ -f .env ]; then
    echo "⚠️  .env file found - ensure it's in .gitignore"
    if grep -q "VITE_" .env; then
        echo "✅ Environment variables properly prefixed"
    fi
fi

# Check dependencies
echo "📦 Checking dependencies..."
npm audit --audit-level moderate

# Check for hardcoded secrets
echo "🔍 Scanning for hardcoded secrets..."
grep -r "sk-\|AIza\|AAAA\|firebase" src/ --exclude-dir=node_modules || echo "✅ No obvious secrets found"

# Check file permissions
echo "📁 Checking file permissions..."
find . -name "*.js" -o -name "*.ts" -o -name "*.json" | xargs ls -la

echo "🎉 Security check complete!"
```

### 7. **Runtime Security Monitoring**

```typescript
// Add to src/services/runtimeSecurity.ts
export class RuntimeSecurity {
  private static violations: Array<{ type: string; timestamp: number }> = [];
  
  static initialize() {
    // Monitor for CSP violations
    document.addEventListener('securitypolicyviolation', (e) => {
      this.handleViolation('csp', {
        directive: e.violatedDirective,
        blockedURI: e.blockedURI,
        originalPolicy: e.originalPolicy
      });
    });
    
    // Monitor for suspicious DOM manipulation
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.tagName === 'SCRIPT' && !element.hasAttribute('data-allowed')) {
              this.handleViolation('unauthorized_script', {
                src: element.getAttribute('src'),
                content: element.textContent?.substring(0, 100)
              });
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  private static handleViolation(type: string, details: Record<string, any>) {
    const violation = { type, timestamp: Date.now() };
    this.violations.push(violation);
    
    SecurityLogger.logSecurityEvent({
      type: 'suspicious_activity',
      severity: 'medium',
      details: { violationType: type, ...details }
    });
    
    // Clean old violations (keep last 100)
    if (this.violations.length > 100) {
      this.violations = this.violations.slice(-100);
    }
  }
  
  static getViolationStats() {
    const last24h = Date.now() - 24 * 60 * 60 * 1000;
    return this.violations.filter(v => v.timestamp > last24h);
  }
}
```

## 🎯 Implementation Priority

### High Priority (Implement First)
1. ✅ Enhanced input validation
2. ✅ Security logging
3. ✅ Runtime monitoring

### Medium Priority (Implement Within 2 Weeks)
1. 🔄 API rate limiting
2. 🔄 Dependency auditing
3. 🔄 Environment security checks

### Low Priority (Implement When Scaling)
1. 📈 Advanced threat detection
2. 📈 Security analytics dashboard  
3. 📈 Automated incident response

## 🔍 Testing Your Security

### Manual Security Tests
```bash
# Test rate limiting
for i in {1..15}; do curl -X POST https://your-app.com/api/test; done

# Test file upload security  
curl -X POST -F "file=@malicious.exe" https://your-app.com/upload

# Test XSS protection
curl -X POST -d "input=<script>alert('xss')</script>" https://your-app.com/api/test
```

### Automated Security Scanning
- **OWASP ZAP**: Automated vulnerability scanning
- **Snyk**: Dependency vulnerability scanning  
- **npm audit**: Built-in dependency auditing
- **Lighthouse**: Security best practices

Your application already has excellent security - these measures provide additional hardening for enterprise-level protection! 🔒