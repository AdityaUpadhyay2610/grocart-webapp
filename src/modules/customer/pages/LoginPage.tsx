import { useLoginForm } from '../hooks/useLoginForm';
import { ArrowRight, Eye, EyeOff, Leaf, ShieldCheck, Store } from 'lucide-react';

export default function LoginPage() {
  const {
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
  } = useLoginForm();

  const toggleMode = () => {
    setIsRegister(!isRegister);
    handleReset();
  };

  return (
    <main className="gc-login" data-theme={isDark ? 'dark' : 'light'}>
      <section className="gc-login-showcase">
        <a className="gc-login-brand" href="/" aria-label="GroCart home">
          <span className="gc-login-mark"><Store size={20} /></span>
          <span>GroCart</span>
        </a>
        <div className="gc-login-message">
          <span className="gc-login-kicker"><Leaf size={15} /> Better groceries, better days</span>
          <h1>Good food starts with a little more care.</h1>
          <p>Fresh picks from trusted local stores, delivered to your door when you need them.</p>
        </div>
        <div className="gc-login-showcase-note">
          <span className="gc-login-note-icon"><ShieldCheck size={19} /></span>
          <span><strong>Shopping made simple</strong><small>Thoughtful picks. Easy checkout.</small></span>
        </div>
      </section>

      <section className="gc-login-panel">
        <a className="gc-login-mobile-brand" href="/" aria-label="GroCart home">
          <span className="gc-login-mark"><Store size={20} /></span>
          <strong>GroCart</strong>
        </a>

        <div className="gc-login-card">
          <div className="gc-login-heading">
            <span className="gc-login-kicker">{isRegister ? 'Join the community' : 'Welcome back'}</span>
            <h2>{isRegister ? 'Create your account' : 'Sign in to GroCart'}</h2>
            <p>{isRegister ? 'A few details and you’re ready to shop.' : 'Your fresh favorites are just around the corner.'}</p>
          </div>

          {errorMsg && <div className="gc-login-alert gc-login-error" role="alert">{errorMsg}</div>}
          {statusMsg && <div className="gc-login-alert gc-login-success" role="status">{statusMsg}</div>}

          <form onSubmit={handleSubmit} className="gc-login-form">
            {isRegister && (
              <>
                <label className="gc-login-field">
                  <span>Full name</span>
                  <input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
                </label>

                <fieldset className="gc-login-role">
                  <legend>Account type</legend>
                  <div className="gc-login-role-options">
                    <button type="button" aria-pressed={role === 'customer'} className={role === 'customer' ? 'selected' : ''} onClick={() => setRole('customer')}>
                      <span>🛍️</span><strong>Customer</strong><small>Shop groceries</small>
                    </button>
                    <button type="button" aria-pressed={role === 'retailer'} className={role === 'retailer' ? 'selected' : ''} onClick={() => setRole('retailer')}>
                      <span>🏪</span><strong>Retailer</strong><small>Manage a store</small>
                    </button>
                  </div>
                </fieldset>

                {role === 'retailer' && (
                  <label className="gc-login-field">
                    <span>Store or business name</span>
                    <input required autoComplete="organization" value={storeName} onChange={(event) => setStoreName(event.target.value)} placeholder="Your store name" />
                  </label>
                )}
              </>
            )}

            <label className="gc-login-field">
              <span>Email address</span>
              <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
            </label>

            <label className="gc-login-field">
              <span>Password</span>
              <span className="gc-login-password">
                <input type={showPassword ? 'text' : 'password'} required autoComplete={isRegister ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>

            {isRegister && (
              <label className="gc-login-field">
                <span>Confirm password</span>
                <input type={showPassword ? 'text' : 'password'} required autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter your password again" />
              </label>
            )}

            <button type="submit" className="gc-login-submit" disabled={loading}>
              {loading ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="gc-login-divider"><span>or continue with</span></div>
          <div className="gc-login-google" ref={googleButtonRef} />

          <p className="gc-login-switch">
            {isRegister ? 'Already have an account?' : 'New to GroCart?'}
            <button type="button" onClick={toggleMode}>{isRegister ? 'Sign in' : 'Create an account'}</button>
          </p>
        </div>

        <p className="gc-login-legal"><ShieldCheck size={14} /> Your account details are protected.</p>
      </section>
    </main>
  );
}
