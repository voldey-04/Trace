import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// ============================================================================
// 1. Request ID Generation & Lifecycle Middleware
// ============================================================================

export function generateRequestId(): string {
  try {
    return `req_${crypto.randomBytes(8).toString('hex')}`;
  } catch {
    return `req_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const incomingId = req.headers['x-request-id'];
  const sanitizedId = typeof incomingId === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(incomingId)
    ? incomingId
    : generateRequestId();

  (req as any).requestId = sanitizedId;
  res.setHeader('x-request-id', sanitizedId);
  next();
}

// ============================================================================
// 2. Security Headers Middleware
// ============================================================================

export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // HSTS (HTTP Strict Transport Security) - standard for production/SSL
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Permissions Policy to disable unused browser capabilities
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // Allow iframe embedding only within compatible development/preview environments
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Content Security Policy compatible with Vite SPA and AI Studio preview frames
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' ws: wss: https: http:",
    "frame-ancestors 'self' https: http:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

  next();
}

// ============================================================================
// 3. CORS Configuration Middleware
// ============================================================================

export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  const configuredOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  // In standard browser interaction or same-origin, allow if matching or same host
  if (origin) {
    let allowOrigin = false;

    if (configuredOrigins.length > 0) {
      if (configuredOrigins.includes(origin) || configuredOrigins.includes('*')) {
        allowOrigin = true;
      }
    } else {
      // Default safe origins: localhost / local dev ports and AI Studio cloud domains
      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      const isGoogleAiStudio = /^https:\/\/([a-zA-Z0-9-]+\.)*(run\.app|google\.com|aistudio\.google)$/.test(origin);
      if (isLocalhost || isGoogleAiStudio) {
        allowOrigin = true;
      }
    }

    if (allowOrigin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Vary', 'Origin');
    }
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, x-request-id');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
}

// ============================================================================
// 4. Rate Limiting Middleware (In-Memory Sliding Window)
// ============================================================================

interface RateLimitBucket {
  count: number;
  resetTime: number;
}

class InMemoryRateLimiter {
  private buckets = new Map<string, RateLimitBucket>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Periodic cleanup of expired buckets every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000).unref();
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, bucket] of this.buckets.entries()) {
      if (now > bucket.resetTime) {
        this.buckets.delete(key);
      }
    }
  }

  public check(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || now > bucket.resetTime) {
      this.buckets.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return { allowed: true, remaining: this.maxRequests - 1, resetTime: now + this.windowMs };
    }

    if (bucket.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: bucket.resetTime };
    }

    bucket.count += 1;
    return { allowed: true, remaining: this.maxRequests - bucket.count, resetTime: bucket.resetTime };
  }
}

// Standard API Limiter: 120 requests per 1 minute per IP
const generalApiLimiter = new InMemoryRateLimiter(60 * 1000, 120);

// Strict Analysis Limiter for computationally intensive analysis / AI tool execution: 40 requests per 1 minute
const intensiveApiLimiter = new InMemoryRateLimiter(60 * 1000, 40);

function getClientIdentifier(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown-client';
}

export function apiRateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const clientKey = `${getClientIdentifier(req)}:api`;
  const result = generalApiLimiter.check(clientKey);

  res.setHeader('X-RateLimit-Limit', '120');
  res.setHeader('X-RateLimit-Remaining', Math.max(0, result.remaining).toString());
  res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString());

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    res.setHeader('Retry-After', Math.max(1, retryAfter).toString());
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests. Rate limit exceeded. Try again in ${Math.max(1, retryAfter)} seconds.`,
      },
      requestId: (req as any).requestId,
    });
  }

  next();
}

export function intensiveRateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const clientKey = `${getClientIdentifier(req)}:intensive`;
  const result = intensiveApiLimiter.check(clientKey);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    res.setHeader('Retry-After', Math.max(1, retryAfter).toString());
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Analysis rate limit exceeded. Please wait ${Math.max(1, retryAfter)} seconds before submitting another request.`,
      },
      requestId: (req as any).requestId,
    });
  }

  next();
}
