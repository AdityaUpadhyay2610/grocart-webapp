export class Product {
  constructor({ id, itemName, itemCategory, itemQuantity, itemPrice, imageUrl }) {
    this.id = id;
    this.itemName = itemName;
    this.itemCategory = itemCategory;
    this.itemQuantity = itemQuantity;
    this.itemPrice = itemPrice;
    this.imageUrl = imageUrl;
  }
}
