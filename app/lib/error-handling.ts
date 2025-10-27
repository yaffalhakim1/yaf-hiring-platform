/**
 * Centralized Error Handling Utility
 *
 * Provides consistent error handling patterns across the application
 * while maintaining complete backward compatibility and user experience.
 */

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  SERVER = 'server',
  NOT_FOUND = 'not_found',
  UNKNOWN = 'unknown',
}

// Standardized error interface
export interface StandardError {
  type: ErrorType;
  message: string;
  originalError?: any;
  statusCode?: number;
  details?: string;
}

/**
 * Extract meaningful error message from various error sources
 */
export function extractErrorMessage(error: any): string {
  // Handle null/undefined
  if (!error) return 'Terjadi kesalahan yang tidak diketahui';

  // Handle string errors
  if (typeof error === 'string') return error;

  // Handle Axios errors
  if (error.response) {
    const { status, data } = error.response;

    // Extract message from API response
    if (data?.message) {
      return data.message;
    }

    // Default messages based on status code
    switch (status) {
      case 400:
        return 'Data yang dikirim tidak valid';
      case 401:
        return 'Sesi telah berakhir, silakan login kembali';
      case 403:
        return 'Akses ditolak, Anda tidak memiliki izin';
      case 404:
        return 'Data tidak ditemukan';
      case 409:
        return 'Data sudah ada atau terjadi konflik';
      case 413:
        return 'File terlalu besar';
      case 415:
        return 'Format file tidak didukung';
      case 422:
        return 'Data tidak dapat diproses';
      case 429:
        return 'Terlalu banyak permintaan, coba lagi nanti';
      case 500:
        return 'Terjadi kesalahan server internal';
      case 502:
        return 'Server tidak dapat dijangkau';
      case 503:
        return 'Layanan sedang tidak tersedia';
      default:
        return `Terjadi kesalahan server (${status})`;
    }
  }

  // Handle network errors
  if (error.request || error.code === 'NETWORK_ERROR') {
    return 'Gagal terhubung ke server, periksa koneksi internet';
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle error objects with message property
  if (error.message) {
    return error.message;
  }

  // Fallback
  return 'Terjadi kesalahan yang tidak diketahui';
}

/**
 * Categorize error type based on error object
 */
export function categorizeError(error: any): ErrorType {
  if (!error) return ErrorType.UNKNOWN;

  // Handle Axios errors
  if (error.response) {
    const status = error.response.status;

    if (status === 401) return ErrorType.AUTHENTICATION;
    if (status === 403) return ErrorType.AUTHORIZATION;
    if (status === 404) return ErrorType.NOT_FOUND;
    if (status >= 400 && status < 500) return ErrorType.VALIDATION;
    if (status >= 500) return ErrorType.SERVER;
  }

  // Handle network errors
  if (error.request || error.code === 'NETWORK_ERROR') {
    return ErrorType.NETWORK;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Create standardized error object
 */
export function createStandardError(error: any): StandardError {
  const message = extractErrorMessage(error);
  const type = categorizeError(error);
  const statusCode = error.response?.status;

  return {
    type,
    message,
    originalError: error,
    statusCode,
    details: error.response?.data?.details,
  };
}

/**
 * Enhanced error message formatting for specific operations
 */
export function formatOperationError(
  operation: string,
  error: any,
  fallbackMessage?: string
): string {
  const standardError = createStandardError(error);
  const baseMessage = standardError.message;

  // For "Unknown error occurred" or similar generic messages, use fallback
  if (
    baseMessage === 'Unknown error occurred' ||
    baseMessage === 'Terjadi kesalahan yang tidak diketahui' ||
    (fallbackMessage && baseMessage.toLowerCase().includes('unknown'))
  ) {
    return fallbackMessage || `Gagal ${operation}`;
  }

  // For specific error messages, combine with operation context
  if (
    baseMessage &&
    !baseMessage.toLowerCase().includes(operation.toLowerCase())
  ) {
    return `Gagal ${operation}: ${baseMessage}`;
  }

  return baseMessage;
}

/**
 * Log error for debugging while respecting production environment
 */
export function logError(
  context: string,
  error: any,
  additionalInfo?: any
): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Error in ${context}`);
    console.error('Error:', error);
    if (additionalInfo) {
      console.log('Additional Info:', additionalInfo);
    }
    if (error.response) {
      console.log('Response Status:', error.response.status);
      console.log('Response Data:', error.response.data);
    }
    console.groupEnd();
  } else {
    // In production, only log essential information
    console.error(`Error in ${context}:`, error.message || error);
  }
}

/**
 * Handle common API operation errors with consistent messaging
 */
export const errorHandlers = {
  // CRUD operation error handlers
  create: (entityName: string) => (error: any) => {
    const message = formatOperationError(
      `membuat ${entityName}`,
      error,
      `Gagal membuat ${entityName}`
    );
    logError(`Create ${entityName}`, error);
    return message;
  },

  update: (entityName: string) => (error: any) => {
    const message = formatOperationError(
      `memperbarui ${entityName}`,
      error,
      `Gagal memperbarui ${entityName}`
    );
    logError(`Update ${entityName}`, error);
    return message;
  },

  delete: (entityName: string) => (error: any) => {
    const message = formatOperationError(
      `menghapus ${entityName}`,
      error,
      `Gagal menghapus ${entityName}`
    );
    logError(`Delete ${entityName}`, error);
    return message;
  },

  fetch: (entityName: string) => (error: any) => {
    const message = formatOperationError(
      `memuat ${entityName}`,
      error,
      `Gagal memuat ${entityName}`
    );
    logError(`Fetch ${entityName}`, error);
    return message;
  },

  // Authentication specific errors
  login: (error: any) => {
    const standardError = createStandardError(error);

    if (standardError.statusCode === 401) {
      return 'Email atau password salah';
    }

    if (standardError.statusCode === 429) {
      return 'Terlalu banyak percobaan login, coba lagi nanti';
    }

    const message = formatOperationError(
      'login',
      error,
      'Gagal masuk ke sistem'
    );
    logError('Login', error);
    return message;
  },

  register: (error: any) => {
    const standardError = createStandardError(error);

    if (standardError.statusCode === 409) {
      return 'Email sudah terdaftar';
    }

    const message = formatOperationError(
      'mendaftar',
      error,
      'Gagal mendaftar akun'
    );
    logError('Register', error);
    return message;
  },

  // File upload specific errors
  upload: (error: any) => {
    const standardError = createStandardError(error);

    if (standardError.statusCode === 413) {
      return 'File terlalu besar, maksimal 20MB';
    }

    if (standardError.statusCode === 415) {
      return 'Format file tidak didukung';
    }

    const message = formatOperationError(
      'mengunggah file',
      error,
      'Gagal mengunggah file'
    );
    logError('File Upload', error);
    return message;
  },
};

/**
 * Success message formatter for consistency
 */
export const successMessages = {
  create: (entityName: string) => `${entityName} berhasil dibuat`,
  update: (entityName: string) => `${entityName} berhasil diperbarui`,
  delete: (entityName: string) => `${entityName} berhasil dihapus`,
  upload: () => 'File berhasil diunggah',
  login: () => 'Login berhasil!',
  register: () => 'Registrasi berhasil!',
  logout: () => 'Anda telah keluar dari sistem',
  changePassword: () => 'Kata sandi berhasil diubah',
  updateProfile: () => 'Profil berhasil diperbarui',
};

/**
 * Retry logic for failed operations
 */
export function shouldRetry(
  error: any,
  retryCount: number = 0,
  maxRetries: number = 3
): boolean {
  if (retryCount >= maxRetries) return false;

  const standardError = createStandardError(error);

  // Retry network errors
  if (standardError.type === ErrorType.NETWORK) return true;

  // Retry server errors (5xx)
  if (standardError.statusCode && standardError.statusCode >= 500) return true;

  // Retry rate limiting (429)
  if (standardError.statusCode === 429) return true;

  return false;
}

/**
 * Delay function for retry logic
 */
export function getRetryDelay(retryCount: number): number {
  // Exponential backoff: 1s, 2s, 4s
  return Math.min(1000 * Math.pow(2, retryCount), 10000);
}
