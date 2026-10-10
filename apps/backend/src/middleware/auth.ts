import { Request, Response, NextFunction } from 'express';
import { AuthService, UserPayload } from '@equation-orchestra/auth';
import { Product } from '../types';

export const authService = new AuthService();

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

/**
 * Enforces mandatory Bearer token authentication.
 * Rejects unauthenticated requests with HTTP 401 Unauthorized.
 */
export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required. Authorization header missing or not Bearer token.',
      code: 'UNAUTHENTICATED'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = authService.verifyToken(token);
    req.user = payload;
    next();
  } catch (err: any) {
    return res.status(401).json({
      error: 'Invalid or expired authentication token',
      code: 'TOKEN_INVALID'
    });
  }
};

/**
 * Optional authentication middleware: attaches user payload if valid Bearer token provided,
 * but does not reject unauthenticated requests.
 */
export const optionalAuthenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = authService.verifyToken(token);
      req.user = payload;
    } catch {
      // Ignored for optional auth
    }
  }
  next();
};

/**
 * Enforces server-side Role-Based Access Control (RBAC).
 * Derives role strictly from verified JWT claims; rejects unauthorized roles with HTTP 403 Forbidden.
 */
export const requireRole = (...allowedRoles: Array<UserPayload['role']>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required prior to permission check',
        code: 'UNAUTHENTICATED'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Role "${req.user.role}" does not have sufficient permissions for this operation.`,
        code: 'FORBIDDEN',
        requiredRoles: allowedRoles
      });
    }

    next();
  };
};

/**
 * Helper to require ADMIN role exclusively.
 */
export const requireAdmin = requireRole('ADMIN');

/**
 * Sanitizes Product response data according to user role.
 * Sensitive purchase costs and margin fields are omitted for STAFF.
 */
export function sanitizeProductForRole(product: Product, role?: string): any {
  if (role === 'STAFF') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { cost, ...safeProduct } = product;
    return safeProduct;
  }
  return product;
}

export function sanitizeProductsForRole(products: Product[], role?: string): any[] {
  if (role === 'STAFF') {
    return products.map(p => sanitizeProductForRole(p, role));
  }
  return products;
}
