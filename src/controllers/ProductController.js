const Product = require("../models/Product");
const moment = require("moment");
class ProductController {
  create(req, res) {
    return res.render("product/register");
  }

  createUpdate(req, res) {
    return res.render("product/updateproduct");
  }

  async index(req, res) {
    const filters = {};

    if (req.body.nome) {
      filters.nome = new RegExp(req.body.nome, "i");

      let products = await Product.find({
        name: new RegExp(req.body.nome, "i"),
      });

      const getProductsPromise = products.map(async (product) => {
        product.formattedExpirationDate = moment(product.expirationDate).format(
          "DD-MM-YYYY"
        );

        return product;
      });

      products = await Promise.all(getProductsPromise);

      return res.render("product/list", {
        products: products,
      });
    }

    let products = await Product.paginate(filters, {
      sort: "-createdAt",
    });

    const getProductsPromise = products.docs.map(async (product) => {
      product.formattedExpirationDate = moment(product.expirationDate).format(
        "DD-MM-YYYY"
      );

      return product;
    });

    products = await Promise.all(getProductsPromise);

    return res.render("product/list", {
      products: products,
    });
  }

  async store(req, res) {
    await Product.create(req.body);

    return res.redirect("/products");
  }

  async edit(req, res) {
    const { id } = req.params;

    let product = await Product.findById(id);

    product.formattedExpirationDate = moment(product.expirationDate).format(
      "YYYY-MM-DD"
    );

    return res.render("product/update", { product: product });
  }

  async update(req, res) {
    const { id } = req.params;

    await Product.findByIdAndUpdate(
      id,
      {
        ...req.body,
        expirationDate: moment(req.body.expirationDate).format(),
      },
      { new: true }
    );

    return res.redirect("/productslist");
  }

  async destroy(req, res) {
    const { id } = req.params;

    await Product.findByIdAndRemove(id);

    return res.redirect("/productslist");
  }
}

module.exports = new ProductController();
