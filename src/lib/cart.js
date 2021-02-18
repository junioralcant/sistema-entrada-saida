const Cart = {
  init(oldCart) {
    if (oldCart) {
      this.items = oldCart.items;
      this.total = oldCart.total;
    } else {
      this.items = [];
      this.total = {
        quantity: 0,
        price: 0,
      };
    }
    return this;
  },
  addOne(product) {
    let inCart = this.items.find(
      (item) => String(item.product._id) == String(product._id)
    );

    if (!inCart) {
      inCart = {
        product: product,
        quantity: 0,
        price: 0,
      };

      this.items.push(inCart);
    }

    if (inCart.quantity >= product.amount) return this;

    inCart.quantity++;
    inCart.price = inCart.product.salePrice * inCart.quantity;

    this.total.quantity++;
    this.total.price += inCart.product.salePrice;

    return this;
  },
  removeOne(productId) {
    const inCart = this.items.find(
      (item) => String(item.product._id) == String(productId)
    );

    if (!inCart) return this;

    inCart.quantity--;
    inCart.price = inCart.product.salePrice * inCart.quantity;

    this.total.quantity--;
    this.total.price -= inCart.product.salePrice;

    if (inCart.quantity < 1) {
      const itemIndex = this.items.indexOf(inCart);
      this.items.splice(itemIndex, 1);
      return this;
    }

    return this;
  },
  delete(productId) {
    const inCart = this.items.find(
      (item) => String(item.product._id) == String(productId)
    );

    if (!inCart) return this;

    if (this.items.length > 0) {
      this.total.quantity -= inCart.quantity;
      this.total.price -= inCart.product.salePrice * inCart.quantity;
    }

    this.items = this.items.filter(
      (item) => inCart.product._id != item.product._id
    );
    return this;
  },
};

module.exports = Cart;
