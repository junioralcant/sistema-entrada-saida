const moment = require("moment");
const formatCurrency = require("../lib/formatCurrency");
const Product = require("../models/Product");

class ProductController {
  create(req, res) {
    return res.render("product/register");
  }

  createUpdate(req, res) {
    return res.render("product/updateproduct");
  }

  async index(req, res) {
    const filters = {};
    let filterActive = false;

    if (req.body.nome) {
      let products = await Product.find({
        name: new RegExp(req.body.nome, "i"),
      });

      const getProductsPromise = products.map(async (product) => {
        product.formattedExpirationDate = moment(product.expirationDate).format(
          "DD-MM-YYYY"
        );

        product.formattedSalePrice = formatCurrency.brl(product.salePrice);

        return product;
      });

      products = await Promise.all(getProductsPromise);

      filterActive = true;

      return res.render("product/list", {
        products: products,
        filterActive,
      });
    }

    if (req.body.searchBarcode) {
      let products = await Product.find({
        barcode: req.body.searchBarcode,
      });

      if (products.length <= 0) {
        return res.redirect("/productslist");
      }

      const getProductsPromise = products.map(async (product) => {
        product.formattedExpirationDate = moment(product.expirationDate).format(
          "DD-MM-YYYY"
        );

        product.formattedSalePrice = formatCurrency.brl(product.salePrice);

        return product;
      });

      products = await Promise.all(getProductsPromise);

      filterActive = true;

      return res.render("product/list", {
        products: products,
        searchBarcode: req.body.searchBarcode,
        filterActive,
      });
    }

    let products = await Product.paginate(filters, {
      limit: parseInt(req.query.limit_page) || 2000,
      sort: "-createdAt",
    });

    const getProductsPromise = products.docs.map(async (product) => {
      product.formattedExpirationDate = moment(product.expirationDate).format(
        "DD-MM-YYYY"
      );
      product.formattedPrice = formatCurrency.brl(product.price);
      product.formattedSalePrice = formatCurrency.brl(product.salePrice);
      return product;
    });

    products = await Promise.all(getProductsPromise);

    return res.render("product/list", {
      products: products,
    });
  }

  async store(req, res) {
    const { name, salePrice, amount, expirationDate, barcode } = req.body;

    if (!name || !salePrice || !amount) {
      let products = await Product.find();

      const getProductsPromise = products.map(async (product) => {
        product.formattedExpirationDate = moment(product.expirationDate).format(
          "DD-MM-YYYY"
        );
        product.formattedPrice = formatCurrency.brl(product.price);
        product.formattedSalePrice = formatCurrency.brl(product.salePrice);
        return product;
      });

      products = await Promise.all(getProductsPromise);

      return res.render("product/list", {
        name,
        salePrice,
        amount,
        barcode,
        products: products,
        expirationDate: moment(expirationDate).format("YYYY-MM-DD"),
        message: "Preencha os campos obrigatórios (*) para continuar!",
      });
    }

    await Product.create({
      ...req.body,
      expirationDate: !req.body.expirationDate
        ? null
        : moment(req.body.expirationDate).format(),
    });

    return res.redirect("/productslist");
  }

  async edit(req, res) {
    const { id } = req.params;

    let product = await Product.findById(id);

    product.formattedExpirationDate = moment(product.expirationDate).format(
      "YYYY-MM-DD"
    );

    return res.render("product/update", {
      product: product,
    });
  }

  async update(req, res) {
    const { id } = req.params;
    const { name, salePrice, amount } = req.body;

    if (!name || !salePrice || !amount) {
      let product = await Product.findById(id);

      product.formattedExpirationDate = moment(product.expirationDate).format(
        "YYYY-MM-DD"
      );

      return res.render("product/update", {
        product: product,
        message: "Preencha os campos obrigatórios (*) para continuar!",
      });
    }

    await Product.findByIdAndUpdate(
      id,
      {
        ...req.body,
        expirationDate: !req.body.expirationDate
          ? null
          : moment(req.body.expirationDate).format(),
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
