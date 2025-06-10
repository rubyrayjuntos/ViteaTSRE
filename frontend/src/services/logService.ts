import { LOGGING_CONFIG, FEATURES } from '../config/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: unknown;
  error?: Error;
}

class Logger {
  private static instance: Logger;
  private logBuffer: LogEntry[] = [];
  private readonly MAX_BUFFER_SIZE = 100;

  private constructor() {
    if (FEATURES.ENABLE_ERROR_REPORTING) {
      window.addEventListener('error', this.handleGlobalError.bind(this));
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!LOGGING_CONFIG.ENABLED) return false;
    
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    return levels[level] >= levels[LOGGING_CONFIG.LEVEL as LogLevel];
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    return `[${timestamp}] ${level} ${entry.message}`;
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.MAX_BUFFER_SIZE) {
      this.logBuffer.shift();
    }
  }

  private handleGlobalError(event: ErrorEvent): void {
    this.error('Uncaught error:', event.error);
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    this.error('Unhandled promise rejection:', event.reason);
  }

  debug(message: string, data?: unknown): void {
    if (!this.shouldLog('debug')) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level: 'debug',
      message,
      data
    };

    console.debug(this.formatMessage(entry), data);
    this.addToBuffer(entry);
  }

  info(message: string, data?: unknown): void {
    if (!this.shouldLog('info')) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level: 'info',
      message,
      data
    };

    console.info(this.formatMessage(entry), data);
    this.addToBuffer(entry);
  }

  warn(message: string, data?: unknown): void {
    if (!this.shouldLog('warn')) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level: 'warn',
      message,
      data
    };

    console.warn(this.formatMessage(entry), data);
    this.addToBuffer(entry);
  }

  error(message: string, error?: Error | unknown): void {
    if (!this.shouldLog('error')) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level: 'error',
      message,
      error: error instanceof Error ? error : new Error(String(error))
    };

    console.error(this.formatMessage(entry), error);
    this.addToBuffer(entry);

    if (FEATURES.ENABLE_ERROR_REPORTING) {
      // Here you could add error reporting service integration
      // e.g., Sentry, LogRocket, etc.
    }
  }

  getBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  clearBuffer(): void {
    this.logBuffer = [];
  }
}

export const logger = Logger.getInstance(); 