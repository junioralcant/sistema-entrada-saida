const moment = require("moment");
const Sale = require("../models/Sale");
const Cart = require("../lib/cart");
const Product = require("../models/Product");
const Entrance = require("../models/Entrance");

class SaleController {
  async index(req, res) {
    let sales = await Sale.find()
      .populate("sale.products.product")
      .sort("-createdAt");

    const getSalesPromise = sales.map(async (sale) => {
      sale.formattedDate = moment(sale.createdAt).format("DD-MM-YYYY");

      return sale;
    });

    sales = await Promise.all(getSalesPromise);

    return res.render("sale/list", {
      sales: sales,
    });
  }

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

    await Entrance.create({
      sale: sale._id,
      value: cart.total.price,
    });

    cart.items.map(async (item) => {
      cart = Cart.init(cart).delete(item.product._id);
      req.session.cart = cart;
    });

    return res.send();
  }

  async destroy(req, res) {
    const { id } = req.params;

    const sale = await Sale.findById(id);

    sale.sale.products.map(async (item) => {
      const product = await Product.findById(item.product);

      product.amount = product.amount + item.quantity;

      await product.save();
    });

    await Sale.findByIdAndDelete(id);

    const entrance = await Entrance.find({ sale: sale._id });

    await Entrance.findByIdAndRemove(entrance[0]._id);

    return res.redirect("/sales");
  }
}

module.exports = new SaleController();
