const Sale = require("../models/Sale");
const Cart = require("../lib/cart");
const Product = require("../models/Product");

class SaleController {
  async store(req, res) {
    let { cart } = req.session;

    if (cart.items <= 0) return res.redirect("/cart");

    const sale = await Sale.create({
      sale: {
        total: cart.total.price,
      },
    });

    await Promise.all(
      cart.items.map(async (item) => {
        sale.sale.products.push(item);
      })
    );

    await sale.save();

    cart.items.map(async (item) => {
      const product = await Product.findById(item.product._id);

      product.amount = product.amount - item.quantity;

      await product.save();
    });

    cart.items.map(async (item) => {
      cart = Cart.init(cart).delete(item.product._id);
      req.session.cart = cart;
    });

    return res.send();
  }
}

module.exports = new SaleController();
