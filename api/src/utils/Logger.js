class Logger {
  static enabled = process.env.DEBUG === 'true';

  static COLORS = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    gray: "\x1b[90m"
  };

  static getTime() {
    return new Date().toLocaleTimeString();
  }

  static formatMessage(level, color, message) {
    return `${color}[${this.getTime()}] [${level}]${this.COLORS.reset} ${message}`;
  }

  static shouldLog(level) {
    if (level === 'DEBUG') {
      return this.enabled;
    }
    return true;
  }

  static setDebug(enabled) {
    this.enabled = enabled;
  }

  static isDebugEnabled() {
    return this.enabled;
  }

  static info(message, ...args) {
    if (this.shouldLog('INFO')) {
      console.log(
        this.formatMessage('INFO', this.COLORS.blue, message),
        ...args
      );
    }
  }

  static error(message, error) {
    if (this.shouldLog('ERROR')) {
      console.error(
        this.formatMessage('ERROR', this.COLORS.red, message)
      );
      if (error?.stack) {
        console.error(`${this.COLORS.red}${error.stack}${this.COLORS.reset}`);
      } else if (error) {
        console.error(`${this.COLORS.red}${error}${this.COLORS.reset}`);
      }
    }
  }

  static warn(message, ...args) {
    if (this.shouldLog('WARN')) {
      console.warn(
        this.formatMessage('WARN', this.COLORS.yellow, message),
        ...args
      );
    }
  }

  static debug(message, ...args) {
    if (this.shouldLog('DEBUG')) {
      console.debug(
        this.formatMessage('DEBUG', this.COLORS.cyan, message),
        ...args
      );
    }
  }

  static ok(message, ...args) {
    if (this.shouldLog('OK')) {
      console.log(
        this.formatMessage('OK', this.COLORS.green, message),
        ...args
      );
    }
  }

  static trace(message, ...args) {
    if (this.shouldLog('TRACE')) {
      console.debug(
        this.formatMessage('TRACE', this.COLORS.gray, message),
        ...args
      );
    }
  }

  static log(level, message, ...args) {
    const colorMap = {
      info: this.COLORS.blue,
      error: this.COLORS.red,
      warn: this.COLORS.yellow,
      debug: this.COLORS.cyan,
      ok: this.COLORS.green,
      trace: this.COLORS.gray
    };

    if (this.shouldLog(level.toUpperCase())) {
      console.log(
        this.formatMessage(level.toUpperCase(), colorMap[level], message),
        ...args
      );
    }
  }
}

module.exports = { Logger };