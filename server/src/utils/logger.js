const config = require('../config/config');

const levels = Object.freeze({
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
});

function write(level, ...values) {
  const configuredLevel = levels[config.logLevel] ?? levels.info;
  if (levels[level] <= configuredLevel) {
    console[level](...values);
  }
}

module.exports = Object.freeze({
  error: (...values) => write('error', ...values),
  warn: (...values) => write('warn', ...values),
  info: (...values) => write('info', ...values),
  debug: (...values) => write('debug', ...values)
});
