const User = require("../models/User");

class UserController {
  create(req, res) {
    return res.render("user/register");
  }

  createUpdate(req, res) {
    return res.render("user/updateuser");
  }

  async index(req, res) {
    const users = await User.paginate();

    return res.render("user/list", { users: users.docs });
  }

  async store(req, res) {
    await User.create(req.body);

    return res.redirect("/");
  }

  async edit(req, res) {
    const { id } = req.params;

    const user = await User.findById(id);

    return res.render("user/update", { user: user });
  }

  async update(req, res) {
    const { id } = req.params;

    await User.findByIdAndUpdate(id, req.body, { new: true });

    return res.redirect("/userslist");
  }

  async destroy(req, res) {
    const { id } = req.params;

    await User.findByIdAndRemove(id);

    return res.redirect("/userslist");
  }
}

module.exports = new UserController();
