const env = import.meta.env;
const configuredApiUrl = (env.VITE_API_URL || '/api').replace(/\/+$/, '');
const apiUrl = !configuredApiUrl
  ? '/api'
  : configuredApiUrl.endsWith('/api')
    ? configuredApiUrl
    : `${configuredApiUrl}/api`;

export const appConfig = {
  apiUrl,
  googleClientId: env.VITE_GOOGLE_CLIENT_ID || '',
  razorpayKeyId: env.VITE_RAZORPAY_KEY_ID || '',
  isGoogleEnabled: Boolean(env.VITE_GOOGLE_CLIENT_ID),
};

export const getGoogleOriginWarning = () => {
  if (!env.DEV || typeof window === 'undefined') {
    return '';
  }

  return `Google auth is not configured for this origin. Add ${window.location.origin} to the OAuth client authorized JavaScript origins.`;
};
