const Category = require("../models/Category");

class CategoryController {
  create(req, res) {
    return res.render("category/register");
  }

  createUpdate(req, res) {
    return res.render("category/updatecategory");
  }

  async index(req, res) {
    const categorys = await Category.paginate();

    return res.render("category/list", { categorys: categorys.docs });
  }

  async store(req, res) {
    await Category.create(req.body);

    return res.redirect("/categorys");
  }

  async edit(req, res) {
    const { id } = req.params;

    const category = await Category.findById(id);

    return res.render("category/update", { category: category });
  }

  async update(req, res) {
    const { id } = req.params;

    await Category.findByIdAndUpdate(id, req.body, { new: true });

    return res.redirect("/categoryslist");
  }

  async destroy(req, res) {
    const { id } = req.params;

    await Category.findByIdAndRemove(id);

    return res.redirect("/categoryslist");
  }
}

module.exports = new CategoryController();
