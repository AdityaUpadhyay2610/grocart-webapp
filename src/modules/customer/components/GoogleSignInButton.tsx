import { forwardRef } from 'react';

interface GoogleSignInButtonProps {
  theme?: 'outline' | 'filled_black' | 'filled_blue';
  width?: number | string;
  className?: string;
}

export const GoogleSignInButton = forwardRef<HTMLDivElement, GoogleSignInButtonProps>(
  ({ theme = 'outline', width = '100%', className = '' }, ref) => {
    return (
      <div
        ref={ref}
        className={className}
        style={{ width, minHeight: 44 }}
        data-google-signin="true"
        data-theme={theme}
      />
    );
  }
);

GoogleSignInButton.displayName = 'GoogleSignInButton';
