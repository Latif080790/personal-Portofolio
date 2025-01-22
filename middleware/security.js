const crypto = require('crypto');
const hpp = require('hpp');
const csurf = require('csurf');
const sanitizeHtml = require('sanitize-html');
const { rateLimit } = require('express-rate-limit');

// Generate nonce for CSP
const generateNonce = () => {
  return crypto.randomBytes(16).toString('base64');
};

// Content Security Policy
const cspMiddleware = (req, res, next) => {
  const nonce = generateNonce();
  res.locals.nonce = nonce;
  
  res.setHeader('Content-Security-Policy', `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' https://cdnjs.cloudflare.com;
    style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self' https://api.example.com;
    frame-ancestors 'none';
    form-action 'self';
    base-uri 'self';
    object-src 'none';
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim());
  
  next();
};

// Advanced rate limiting
const createRateLimiter = (options) => rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || 
           req.connection.remoteAddress ||
           req.headers['x-real-ip'];
  },
  ...options
});

// Input sanitization
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeHtml(req.body[key], {
          allowedTags: [],
          allowedAttributes: {}
        });
      }
    });
  }
  next();
};

// Security headers
const securityHeaders = (req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
};

// CSRF protection
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// SQL Injection prevention
const sqlInjectionPrevention = (req, res, next) => {
  const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/gi;
  const hasSQL = Object.values(req.body || {}).some(value => 
    typeof value === 'string' && sqlPattern.test(value)
  );
  
  if (hasSQL) {
    return res.status(403).json({ error: 'Potential SQL injection detected' });
  }
  next();
};

module.exports = {
  cspMiddleware,
  createRateLimiter,
  sanitizeInput,
  securityHeaders,
  csrfProtection,
  sqlInjectionPrevention,
  hpp // HTTP Parameter Pollution prevention
};
