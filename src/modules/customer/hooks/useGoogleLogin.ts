import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { appConfig, getGoogleOriginWarning } from '@global/config/appConfig';
import { authApi } from '@global/services/api/authApi';
import { setUserProfile } from '@global/store';
import { redirectByRole } from '@global/utils/authRedirect';
import { initGoogle, renderGoogleButton, cancelGoogle } from '@global/utils/googleIdentity';

export const useGoogleLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let closed = false;

    const mount = async () => {
      if (!buttonRef.current) {
        return;
      }

      const clientId = appConfig.googleClientId;
      if (!clientId) {
        if (import.meta.env.DEV) {
          console.warn(getGoogleOriginWarning());
        }
        return;
      }

      try {
        const nonce = await authApi.getGoogleNonce();
        if (closed) {
          return;
        }

        await initGoogle({
          clientId,
          nonce,
          callback: async (response: any) => {
            if (!response?.credential) {
              setError('Google sign-in cancelled.');
              return;
            }

            setIsLoading(true);
            try {
              const user = await authApi.loginWithGoogle(response.credential);
              dispatch(setUserProfile(user));
              redirectByRole(user.role, navigate);
            } catch (err: any) {
              setError(err.message || 'Google sign-in failed.');
            } finally {
              setIsLoading(false);
            }
          },
        });

        buttonRef.current.innerHTML = '';
        renderGoogleButton(buttonRef.current, { theme: 'outline', size: 'large', width: '100%' });
      } catch (err: any) {
        setError(err.message || 'Google sign-in is unavailable.');
      }
    };

    mount();

    return () => {
      closed = true;
      cancelGoogle();
    };
  }, [dispatch, navigate]);

  return { buttonRef, isLoading, error };
};
