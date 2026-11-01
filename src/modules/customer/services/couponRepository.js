import { apiClient } from '@global/utils/axiosInstance';

export const validateCoupon = async (code, items) => {
  const response = await apiClient.post('/coupons/validate', {
    code,
    items: items.map((item) => ({
      productId: item.productId || item.id,
      quantity: item.quantity,
    })),
  });

  return response.data.data;
};
