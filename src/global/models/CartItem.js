export class CartItem {
  constructor({ id, itemName, itemPrice, itemQuantity = "500g", imageUrl, itemStock = 0, quantity = 1, itemCost = 0, retailerId = "" }) {
    this.id = id;
    this.itemName = itemName;
    this.itemPrice = itemPrice;
    this.itemQuantity = itemQuantity;
    this.imageUrl = imageUrl;
    this.itemStock = itemStock;
    this.quantity = quantity;
    this.itemCost = itemCost;
    this.retailerId = retailerId;
  }

  // Pure domain method to calculate total price for this item row
  get rowTotal() {
    return this.itemPrice * this.quantity;
  }
}

