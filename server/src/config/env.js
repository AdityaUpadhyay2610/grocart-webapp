const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const readString = (key, fallback = '') => {
  const value = process.env[key];
  if (value === undefined || value === null || value.trim() === '') {
    return fallback;
  }
  return value.trim();
};

const readNumber = (key, fallback) => {
  const raw = process.env[key];
  if (raw === undefined || raw === null || raw.trim() === '') {
    return fallback;
  }

  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    throw new Error(`[Config Error] Environment variable ${key} must be a valid number, received: "${raw}"`);
  }

  return parsed;
};

const requireEnv = (key, message) => {
  const value = readString(key);
  if (!value) {
    throw new Error(message || `[Config Error] Missing required environment variable: ${key}`);
  }
  return value;
};

module.exports = {
  env: process.env,
  readString,
  readNumber,
  requireEnv,
};
