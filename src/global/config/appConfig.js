const env = import.meta.env;

export const appConfig = {
  apiUrl: env.VITE_API_URL || '/api',
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
