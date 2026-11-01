const ORDER_STATUS = Object.freeze({
  PLACED: 'placed',
  PROCESSING: 'processing',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned'
});

const PRODUCT_STATUS = Object.freeze({
  ACTIVE: 'active',
  OUT_OF_STOCK: 'out_of_stock'
});

const USER_ROLE = Object.freeze({
  ADMIN: 'admin',
  RETAILER: 'retailer',
  CUSTOMER: 'customer'
});

const PRODUCT_UNITS = Object.freeze([
  'pcs', 'kg', 'g', 'l', 'ml', 'liter', 'dozen', 'pack', 'bunch', 'bottle', 'box', 'bag'
]);

const JWT_ALGORITHM = 'HS256';
const COOKIE_REQUEST_HEADER = 'x-grocart-request';
const COOKIE_REQUEST_HEADER_VALUE = '1';

const ORDER_STATUS_TRANSITIONS = Object.freeze({
  placed: Object.freeze({
    customer: Object.freeze(['cancelled']),
    retailer: Object.freeze(['processing']),
    admin: Object.freeze(['processing', 'cancelled'])
  }),
  processing: Object.freeze({
    customer: Object.freeze(['cancelled']),
    retailer: Object.freeze(['delivered']),
    admin: Object.freeze(['delivered', 'cancelled'])
  }),
  delivered: Object.freeze({
    customer: Object.freeze(['returned']),
    admin: Object.freeze(['returned'])
  }),
  cancelled: Object.freeze({}),
  returned: Object.freeze({})
});

const ORDER_STATUSES = Object.freeze(Object.values(ORDER_STATUS));

module.exports = {
  ORDER_STATUS,
  PRODUCT_STATUS,
  USER_ROLE,
  PRODUCT_UNITS,
  JWT_ALGORITHM,
  COOKIE_REQUEST_HEADER,
  COOKIE_REQUEST_HEADER_VALUE,
  ORDER_STATUSES,
  ORDER_STATUS_TRANSITIONS
};
