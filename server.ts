import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { createApiRouter } from './src/server/apiRouter';
import { securityHeadersMiddleware, corsMiddleware, requestIdMiddleware } from './src/server/security';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Disable fingerprinting headers
  app.disable('x-powered-by');

  // 2. Global Request ID & Security Headers
  app.use(requestIdMiddleware);
  app.use(securityHeadersMiddleware);
  app.use(corsMiddleware);

  // 3. Body parsers with safe size limits (prevents payload memory exhaustion attacks)
  app.use(express.json({
    limit: '2mb',
    strict: true,
  }));
  app.use(express.urlencoded({
    extended: false,
    limit: '2mb',
  }));

  // 4. Catch Body Parser Syntax Errors (e.g. malformed JSON)
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      const reqId = (req as any).requestId || `req_${Date.now().toString(36)}`;
      return res.status(400).json({
        success: false,
        error: {
          code: 'MALFORMED_JSON',
          message: 'Malformed or invalid JSON payload in request body.',
        },
        requestId: reqId,
      });
    }
    next(err);
  });

  // 5. Mount TRACE API Router FIRST
  const apiRouter = createApiRouter();
  app.use('/api', apiRouter);

  // 6. Development vs Production static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      dotfiles: 'ignore',
      index: false,
      maxAge: '1h',
    }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 7. Final Global Fallback Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const reqId = (req as any).requestId || `req_${Date.now().toString(36)}`;
    console.error(`[${reqId}] Fatal Server Exception:`, err?.message || err);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'A fatal server error occurred.',
      },
      requestId: reqId,
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TRACE Investigation Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to initialize TRACE server:', err);
  process.exit(1);
});
