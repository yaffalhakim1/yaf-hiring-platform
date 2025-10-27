/**
 * Authentication and Authorization Types
 * Centralized type definitions for user authentication, roles, and permissions
 */

export type UserRole = 'admin' | 'applicant';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;

  // Authorization wrappers
  withAuth: <T>(
    operation: () => Promise<T>,
    requiredRole?: UserRole
  ) => Promise<T>;
  withAdminAuth: <T>(operation: () => Promise<T>) => Promise<T>;

  // Auth utilities
  getCurrentUserId: () => string | null;
  getAuthHeaders: () => Promise<Record<string, string>>;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetData {
  token: string;
  newPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}
