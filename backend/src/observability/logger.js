// Simple structured logger (replace with pino/winston in prod)

class Logger {
  info(msg, meta) {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        msg,
        ...meta,
      }),
    );
  }
  warn(msg, meta) {
    console.warn(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'warn',
        msg,
        ...meta,
      }),
    );
  }
  error(msg, meta) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        msg,
        ...meta,
      }),
    );
  }
  debug(msg, meta) {
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'debug',
          msg,
          ...meta,
        }),
      );
    }
  }
}

const logger = new Logger();
export default logger;
