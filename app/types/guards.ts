/**
 * Guard Component Types
 * Types for authentication and authorization guard components
 */

import { type ReactNode } from 'react';

export interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
  redirectTo?: string;
}
