/**
 * Simple logging utility with conditional output based on environment
 * Provides consistent logging interface throughout the application
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Logging utility class
 * In production, only errors are logged
 * In development, all logs are displayed
 */
export class Logger {
  /**
   * Log informational message - only in development
   */
  static info(...args: any[]): void {
    if (isDevelopment) {
      console.log('[INFO]', ...args);
    }
  }

  /**
   * Log warning message - only in development
   */
  static warn(...args: any[]): void {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  }

  /**
   * Log error message - always logged
   */
  static error(...args: any[]): void {
    console.error('[ERROR]', ...args);
  }

  /**
   * Log debug message - only in development
   */
  static debug(...args: any[]): void {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  }

  /**
   * Log success message - only in development
   */
  static success(...args: any[]): void {
    if (isDevelopment) {
      console.log('[SUCCESS]', ...args);
    }
  }
}
