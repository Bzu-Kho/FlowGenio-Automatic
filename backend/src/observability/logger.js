// Simple structured logger (replace with pino/winston in prod)
class Logger {
  info(msg, meta) { console.log(JSON.stringify({ level: 'info', msg, ...meta })); }
  warn(msg, meta) { console.warn(JSON.stringify({ level: 'warn', msg, ...meta })); }
  error(msg, meta) { console.error(JSON.stringify({ level: 'error', msg, ...meta })); }
}

const logger = new Logger();
export default logger;
