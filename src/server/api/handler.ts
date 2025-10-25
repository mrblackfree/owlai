import { Request, Response } from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

type Handler = {
  get: (path: string, handler: (req: Request, res: Response) => Promise<void>) => void;
  post: (path: string, handler: (req: Request, res: Response) => Promise<void>) => void;
  patch: (path: string, handler: (req: Request, res: Response) => Promise<void>) => void;
  delete: (path: string, handler: (req: Request, res: Response) => Promise<void>) => void;
  middleware: () => any;
};

export function createHandler(): Handler {
  const routes = new Map<string, Map<string, (req: Request, res: Response) => Promise<void>>>();

  const handler: Handler = {
    get(path, routeHandler) {
      if (!routes.has('GET')) routes.set('GET', new Map());
      routes.get('GET')!.set(path, routeHandler);
    },
    post(path, routeHandler) {
      if (!routes.has('POST')) routes.set('POST', new Map());
      routes.get('POST')!.set(path, routeHandler);
    },
    patch(path, routeHandler) {
      if (!routes.has('PATCH')) routes.set('PATCH', new Map());
      routes.get('PATCH')!.set(path, routeHandler);
    },
    delete(path, routeHandler) {
      if (!routes.has('DELETE')) routes.set('DELETE', new Map());
      routes.get('DELETE')!.set(path, routeHandler);
    },
    middleware() {
      return async (req: Request, res: Response) => {
        try {
          // Convert route patterns to regex
          const method = req.method;
          const methodRoutes = routes.get(method);
          
          if (!methodRoutes) {
            return res.status(405).json({ error: 'Method not allowed' });
          }

          console.log('Processing request:', { method, path: req.path });

          let matchedHandler: ((req: Request, res: Response) => Promise<void>) | undefined;
          let matchedParams: { [key: string]: string } = {};

          for (const [pattern, handler] of methodRoutes.entries()) {
            // Convert Express-style route patterns to regex
            const regexPattern = pattern
              .replace(/:[a-zA-Z]+/g, '([^/]+)')
              .replace(/\//g, '\\/');
            const regex = new RegExp(`^${regexPattern}$`);
            
            console.log('Route matching:', { pattern, requestPath: req.path, matches: regex.test(req.path) });

            if (regex.test(req.path)) {
              matchedHandler = handler;
              
              // Extract route parameters
              const paramNames = (pattern.match(/:[a-zA-Z]+/g) || [])
                .map(param => param.substring(1));
              const paramValues = req.path.match(regex)?.slice(1) || [];
              
              matchedParams = Object.fromEntries(
                paramNames.map((name, i) => [name, paramValues[i]])
              );

              break;
            }
          }

          if (!matchedHandler) {
            return res.status(404).json({ error: 'Not found' });
          }

          console.log('Found matching handler:', req.path);
          console.log('Extracted params:', matchedParams);

          // Add params to request object
          req.params = { ...req.params, ...matchedParams };

          // Check if user is authenticated for non-GET requests
          if (method !== 'GET') {
            try {
              const auth = await ClerkExpressRequireAuth()(req as any, res as any, () => {});
              console.log('Clerk auth passed, user:', auth?.auth?.userId);
            } catch (error) {
              console.error('Auth error:', error);
              return res.status(401).json({ error: 'Unauthorized' });
            }
          }

          await matchedHandler(req, res);
        } catch (error) {
          console.error('Handler error:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      };
    },
  };

  return handler;
} 