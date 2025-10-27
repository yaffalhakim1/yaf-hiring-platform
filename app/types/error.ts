/**
 * Error Component Types
 * Types for error handling and error display components
 */

export interface ErrorPageProps {
  statusCode?: number;
  title?: string;
  message?: string;
  showStackTrace?: boolean;
  stackTrace?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}
