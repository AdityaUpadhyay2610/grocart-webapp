type GoogleInitArgs = {
  clientId: string;
  nonce?: string;
  callback: (response: any) => void;
  uxMode?: 'popup' | 'redirect';
  useFedcmForPrompt?: boolean;
};

let scriptPromise: Promise<void> | null = null;
const initializedClients = new Set<string>();

const ensureGoogleScript = async (): Promise<void> => {
  if ((window as any).google?.accounts?.id) {
    return;
  }

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Google Identity script failed to load.')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Google Identity script failed to load.'));
      document.head.appendChild(script);
    });
  }

  await scriptPromise;
};

export const initGoogle = async ({ clientId, nonce, callback, uxMode = 'popup', useFedcmForPrompt = true }: GoogleInitArgs): Promise<void> => {
  if (!clientId) {
    throw new Error('Google client ID is missing.');
  }

  await ensureGoogleScript();
  const google = (window as any).google;
  if (!google?.accounts?.id) {
    throw new Error('Google identity SDK is not available.');
  }

  const key = `${clientId}:${nonce || 'none'}`;
  if (!initializedClients.has(key)) {
    google.accounts.id.initialize({
      client_id: clientId,
      callback,
      nonce,
      ux_mode: uxMode,
      use_fedcm_for_prompt: useFedcmForPrompt,
    });
    initializedClients.add(key);
  }
};

export const renderGoogleButton = (container: HTMLElement, options: Record<string, any> = {}): void => {
  const google = (window as any).google;
  if (!google?.accounts?.id || !container) {
    return;
  }

  google.accounts.id.renderButton(container, {
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'pill',
    width: '100%',
    ...options,
  });
};

export const cancelGoogle = (): void => {
  const google = (window as any).google;
  if (google?.accounts?.id) {
    google.accounts.id.cancel();
  }
};
