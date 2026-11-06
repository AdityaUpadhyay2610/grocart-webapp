import { NavigateFunction } from 'react-router';

export const redirectByRole = (role: string | undefined, navigate: NavigateFunction) => {
  if (role === 'admin') {
    navigate('/admin/dashboard', { replace: true });
    return;
  }

  if (role === 'retailer') {
    navigate('/retailer/dashboard', { replace: true });
    return;
  }

  navigate('/', { replace: true });
};
