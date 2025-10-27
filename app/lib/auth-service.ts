import { supabaseClient } from './supabase.client';
import { errorHandlers } from './error-handling';

export class AuthService {
  // Get current authenticated user (for use in services)
  static async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabaseClient.auth.getUser();

      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  // Get user session (for use in services)
  static async getSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabaseClient.auth.getSession();

      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  // Get auth headers for API requests
  static async getAuthHeaders() {
    const session = await this.getSession();

    if (!session) {
      throw new Error('No active session found');
    }

    return {
      Authorization: `Bearer ${session.access_token}`,
      // Include any additional headers needed for RLS
      'X-User-Role': session.user?.user_metadata?.role || 'user',
    };
  }

  // Sign out
  static async signOut() {
    try {
      const { error } = await supabaseClient.auth.signOut();

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to sign out:', error);
      return false;
    }
  }

  // Refresh session
  static async refreshSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabaseClient.auth.refreshSession();

      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      return null;
    }
  }
}
