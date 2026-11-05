// server/src/utils/googleAuth.js
// Checks a Google ID token on the server and returns a small, trusted profile.
// Nothing the browser says about the user is believed until this file approves it.

const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const config = require('../config/config');

const client = config.google.enabled ? new OAuth2Client(config.google.clientId) : null;

// Random one-time value that ties a Google token to the browser that asked for it.
function createNonce() {
  return crypto.randomBytes(24).toString('base64url');
}

// Compare two strings without leaking where they first differ.
function safeEqual(a, b) {
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

async function verifyGoogleCredential(idToken, expectedNonce) {
  if (!client) {
    throw new Error('Google sign-in is not configured.');
  }
  if (!expectedNonce) {
    throw new Error('Nonce cookie is missing or expired.');
  }

  // Verifies signature, audience (our client id), issuer and expiry.
  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.google.clientId
  });
  const payload = ticket.getPayload();

  if (!payload || !payload.sub || !payload.email) {
    throw new Error('Token has no subject or email.');
  }
  if (payload.email_verified !== true) {
    throw new Error('Google has not verified this email.');
  }
  if (!payload.nonce || !safeEqual(payload.nonce, expectedNonce)) {
    throw new Error('Nonce does not match.');
  }

  const email = payload.email.trim().toLowerCase();
  return {
    sub: payload.sub,
    email,
    name: String(payload.name || email.split('@')[0]).trim().slice(0, 100),
    // Google is the real owner of @gmail.com and Workspace (hd) addresses only.
    emailIsAuthoritative: email.endsWith('@gmail.com') || Boolean(payload.hd)
  };
}

module.exports = { createNonce, verifyGoogleCredential };