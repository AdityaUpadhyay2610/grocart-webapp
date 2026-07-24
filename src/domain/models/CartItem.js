export class CartItem {
  constructor({ id, itemName, itemPrice, imageUrl, quantity = 1 }) {
    this.id = id;
    this.itemName = itemName;
    this.itemPrice = itemPrice;
    this.imageUrl = imageUrl;
    this.quantity = quantity;
  }

  // Pure domain method to calculate total price for this item row (applying 25% discount)
  get rowTotal() {
    return Math.floor((this.itemPrice * 75 / 100) * this.quantity);
  }
}
