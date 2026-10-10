import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_procurement_key';

export interface UserPayload {
  userId: string;
  email: string;
  organizationId: string;
  role: 'BUYER' | 'VENDOR' | 'ADMIN' | 'STAFF';
  permissions: string[];
}

export class AuthService {
  generateToken(payload: UserPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  }

  verifyToken(token: string): UserPayload {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  }

  hasPermission(payload: UserPayload, requiredPermission: string): boolean {
    if (payload.role === 'ADMIN') return true;
    return payload.permissions.includes(requiredPermission);
  }

  isAdmin(payload: UserPayload): boolean {
    return payload.role === 'ADMIN';
  }

  isStaff(payload: UserPayload): boolean {
    return payload.role === 'STAFF';
  }

  isBuyer(payload: UserPayload): boolean {
    return payload.role === 'ADMIN' || payload.role === 'BUYER';
  }

  isVendor(payload: UserPayload): boolean {
    return payload.role === 'ADMIN' || payload.role === 'VENDOR';
  }
}
