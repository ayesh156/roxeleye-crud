const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Format date for log filename
const getLogFileName = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}.log`;
};

// Format timestamp for log entry
const getTimestamp = () => {
  return new Date().toISOString();
};

// Log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Write log to file
const writeLog = (level, message, meta = {}) => {
  const logFileName = getLogFileName();
  const logFilePath = path.join(logsDir, logFileName);
  
  const logEntry = {
    timestamp: getTimestamp(),
    level,
    message,
    ...meta
  };
  
  const logLine = JSON.stringify(logEntry) + '\n';
  
  fs.appendFileSync(logFilePath, logLine, 'utf8');
  
  // Also log to console in development
  if (process.env.NODE_ENV !== 'production') {
    const consoleMethod = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log';
    console[consoleMethod](`[${logEntry.timestamp}] [${level}]`, message, meta.error || '');
  }
};

// Logger methods
const logger = {
  error: (message, meta = {}) => writeLog(LOG_LEVELS.ERROR, message, meta),
  warn: (message, meta = {}) => writeLog(LOG_LEVELS.WARN, message, meta),
  info: (message, meta = {}) => writeLog(LOG_LEVELS.INFO, message, meta),
  debug: (message, meta = {}) => writeLog(LOG_LEVELS.DEBUG, message, meta)
};

module.exports = logger;
