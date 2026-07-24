export class Order {
  constructor({ id = null, items = [], timestamp = Date.now(), totalPaid = 0, couponDiscount = 0 }) {
    this.id = id;
    this.items = items; // List of CartItem
    this.timestamp = timestamp;
    this.totalPaid = totalPaid;
    this.couponDiscount = couponDiscount;
  }
}
