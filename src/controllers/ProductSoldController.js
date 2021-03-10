const ProductSold = require("../models/ProductSold");
const Product = require("../models/Product");
const moment = require("moment");

class ProductSoldController {
  create(req, res) {
    return res.render("product/register");
  }

  async indexProduct(req, res) {
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

      return res.render("productSold/list", {
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
    const { products } = req.body;

    const productSald = await ProductSold.create(req.body);

    await Promise.all(
      products.map(async (product) => {
        const productAll = await Product.findById(product.productId);

        const value = productAll.price * product.quantidade;

        productSald.product.push({ ...product, value });
      })
    );

    const totalValue = productSald.product.reduce(
      (totalValue, value) => totalValue + value.value,
      0
    );

    productSald.totalValue = totalValue;

    await productSald.save();

    return res.json(productSald);
  }
}

module.exports = new ProductSoldController();
