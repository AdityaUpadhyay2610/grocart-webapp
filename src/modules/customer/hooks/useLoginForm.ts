import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { appConfig, getGoogleOriginWarning } from '@global/config/appConfig';
import { authApi } from '@global/services/api/authApi';
import { setUserProfile } from '@global/store';
import { UserRole } from '@global/models';
import { useTheme } from '@global/context/ThemeContext';
import { redirectByRole } from '@global/utils/authRedirect';
import { initGoogle, renderGoogleButton, cancelGoogle } from '@global/utils/googleIdentity';

export function useLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleReset = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setStoreName('');
    setRole('customer');
    setErrorMsg('');
    setStatusMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');

    if (isRegister && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const message = await authApi.registerUser(
          email,
          password,
          name,
          role,
          storeName,
          confirmPassword
        );
        setIsRegister(false);
        setPassword('');
        setConfirmPassword('');
        setStatusMsg(`${message} Sign in to continue.`);
        return;
      }

      const profile = await authApi.loginUser(email, password);
      dispatch(setUserProfile(profile));
      redirectByRole(profile.role, navigate);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const setupGoogleAuth = async () => {
      const clientId = appConfig.googleClientId;
      if (!clientId || !googleButtonRef.current) {
        if (import.meta.env.DEV) {
          console.warn(getGoogleOriginWarning());
        }
        return;
      }

      try {
        const nonce = await authApi.getGoogleNonce();
        if (!isMounted || !nonce) return;

        const handleGoogleCallback = async (response: any) => {
          setLoading(true);
          setErrorMsg('');
          try {
            const user = await authApi.loginWithGoogle(
              response.credential,
              isRegister ? { intent: 'register', role, storeName } : { intent: 'login' }
            );
            dispatch(setUserProfile(user));
            redirectByRole(user.role, navigate);
          } catch (err: any) {
            console.error('Google login failed', err);
            setErrorMsg(err.message || 'Google sign-in failed. Please try again.');
          } finally {
            setLoading(false);
          }
        };

        await initGoogle({
          clientId,
          nonce,
          callback: handleGoogleCallback,
          uxMode: 'popup',
        });

        googleButtonRef.current.innerHTML = '';
        renderGoogleButton(googleButtonRef.current, {
          theme: isDark ? 'filled_black' : 'outline',
          width: 320,
          shape: 'pill',
          text: 'continue_with',
        });
      } catch (err: any) {
        console.warn('Failed to fetch Google OAuth nonce:', err?.message || err);
      }
    };

    setupGoogleAuth();

    return () => {
      isMounted = false;
      cancelGoogle();
    };
  }, [isDark, dispatch, navigate, isRegister, role, storeName]);

  return {
    showPassword,
    setShowPassword,
    isRegister,
    setIsRegister,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    name,
    setName,
    storeName,
    setStoreName,
    role,
    setRole,
    errorMsg,
    statusMsg,
    loading,
    isDark,
    googleButtonRef,
    handleReset,
    handleSubmit,
  };
}
