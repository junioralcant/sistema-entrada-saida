const User = require("../models/User");

class SessionController {
  loginForm(req, res) {
    return res.render("login/index");
  }

  logout(req, res) {
    req.session.destroy();
    return res.redirect("/login");
  }

  async store(req, resp) {
    const { email, password } = req.body;

    const user = await User.findOne({ email }); // recebe o email existende no bd, que no caso é unico

    if (!user) {
      return resp.render("login/index", {
        user: req.body,
        error: "Usuário não encontrado!",
      });
    }

    if (!(await user.compareHash(password))) {
      // se as senhas forem diferentes
      return resp.render("login/index", {
        user: req.body,
        error: "Senha incorreta.",
      });
    }

    req.session.userId = user._id;

    return resp.redirect("/");
  }
}

module.exports = new SessionController();
