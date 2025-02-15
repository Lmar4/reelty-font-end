type LogLevel = "debug" | "info" | "warn" | "error";

interface LoggerOptions {
  level: LogLevel;
  timestamp?: boolean;
  prefix?: string;
}

class Logger {
  private level: LogLevel;
  private timestamp: boolean;
  private prefix: string;

  private readonly LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(options: LoggerOptions) {
    this.level = options.level;
    this.timestamp = options.timestamp ?? true;
    this.prefix = options.prefix ?? "";
  }

  private shouldLog(level: LogLevel): boolean {
    return this.LOG_LEVELS[level] >= this.LOG_LEVELS[this.level];
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const parts = [this.prefix];

    if (this.timestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    parts.push(`[${level.toUpperCase()}]`);
    parts.push(message);

    return parts.filter(Boolean).join(" ");
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, data);

    switch (level) {
      case "debug":
        console.debug(formattedMessage, data ?? "");
        break;
      case "info":
        console.info(formattedMessage, data ?? "");
        break;
      case "warn":
        console.warn(formattedMessage, data ?? "");
        break;
      case "error":
        console.error(formattedMessage, data ?? "");
        break;
    }
  }

  debug(message: string, data?: any): void {
    this.log("debug", message, data);
  }

  info(message: string, data?: any): void {
    this.log("info", message, data);
  }

  warn(message: string, data?: any): void {
    this.log("warn", message, data);
  }

  error(message: string, data?: any): void {
    this.log("error", message, data);
  }
}

// Create a singleton instance with default options
export const logger = new Logger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  timestamp: true,
  prefix: "[REELTY]",
});
