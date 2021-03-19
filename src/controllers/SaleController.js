const moment = require("moment");
const Sale = require("../models/Sale");
const Cart = require("../lib/cart");
const Product = require("../models/Product");
const Entrance = require("../models/Entrance");
const formatCurrency = require("../lib/formatCurrency");

class SaleController {
  async index(req, res) {
    const filters = {};

    let total = 0;

    const { startDate, finalDate } = req.body;

    if (startDate || finalDate) {
      filters.createdAt = {};

      const startDate = moment(req.body.startDate).format(
        "YYYY-MM-DDT00:mm:ss.SSSZ"
      );

      const finalDate = moment(req.body.finalDate).format(
        "YYYY-MM-DDT23:59:ss.SSSZ"
      );

      filters.createdAt.$gte = startDate;
      filters.createdAt.$lte = finalDate;
    }

    let sales = await Sale.paginate(filters, {
      page: req.query.page || 1,
      limit: parseInt(req.query.limit_page) || 2000,
      populate: ["sale.products.product"],
      sort: "-createdAt",
    });

    const getSalesPromise = sales.docs.map(async (sale) => {
      sale.formattedDate = moment(sale.createdAt).format("DD-MM-YYYY");
      sale.sale.products.map((product) => {
        product.formattedPrice = formatCurrency.brl(product.price);
      });

      sale.sale.formattedTotal = formatCurrency.brl(sale.sale.total);

      if (!sale.sale.descount) {
        sale.sale.descount = 0;
      }

      return sale;
    });

    sales = await Promise.all(getSalesPromise);

    let dateFilter = false;

    if (startDate || finalDate) {
      sales.map((sale) => {
        total += sale.sale.total;
      });

      dateFilter = true;
    }

    if (!startDate || !finalDate) {
      sales = sales.map((sale) => {
        if (moment(sale.createdAt).month() === moment(Date.now()).month()) {
          total += sale.sale.total;
          return sale;
        }
      });
    }

    let salesFilter = [];

    sales.map((sale) => {
      if (sale != undefined) salesFilter.push(sale);
    });

    return res.render("sale/list", {
      sales: salesFilter,
      total: formatCurrency.brl(total),
      dateFilter: dateFilter,
      startDate,
      finalDate,
    });
  }

  async store(req, res) {
    let { cart } = req.session;
    const { descount } = req.body;

    if (cart.items <= 0) return res.redirect("/cart");

    const sale = await Sale.create({
      sale: {
        total: cart.total.price - (cart.total.price / 100) * descount,
        descount,
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
      value: cart.total.price - descount,
    });

    cart.items.map(async (item) => {
      cart = Cart.init(cart).delete(item.product._id);
      req.session.cart = cart;
    });

    return res.redirect("/cart");
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

  async destroyAll(req, res) {
    let { cart } = req.session;

    if (cart.items <= 0) return res.redirect("/cart");

    cart.items.map(async (item) => {
      cart = Cart.init(cart).delete(item.product._id);
      req.session.cart = cart;
    });

    return res.redirect("/cart");
  }
}

module.exports = new SaleController();
