import { env } from '../core/helpers.js';

// Simple logger middleware
export const logger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  const logData = {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString()
  };

  if (env('NODE_ENV') === 'development') {
    console.log(`[${logData.method}] ${logData.url} - ${logData.ip}`);
  }

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    logData.status = res.statusCode;
    logData.duration = `${duration}ms`;

    if (env('NODE_ENV') === 'development') {
      console.log(`[${logData.method}] ${logData.url} - ${logData.status} - ${logData.duration}`);
    }

    // Log errors
    if (res.statusCode >= 400) {
      console.error(`[ERROR] ${logData.method} ${logData.url} - ${logData.status}`, {
        ...logData,
        body: req.body,
        query: req.query
      });
    }
  });

  next();
};

// Error logger
export const errorLogger = (err, req, res, next) => {
  const errorLog = {
    error: err.message,
    stack: env('NODE_ENV') === 'development' ? err.stack : undefined,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    body: req.body,
    query: req.query,
    timestamp: new Date().toISOString()
  };

  console.error('[ERROR]', errorLog);

  next(err);
};


