const Exit = require("../models/Exit");
const moment = require("moment");

class ExitController {
  async index(req, res) {
    const filters = {};

    let exits = await Exit.paginate(filters, {
      sort: "-date",
    });

    const getExitPromise = exits.docs.map(async (exit) => {
      exit.formattedDate = moment(exit.date).format("DD-MM-YYYY");

      return exit;
    });

    exits = await Promise.all(getExitPromise);

    return res.render("exit/list", { exits: exits });
  }

  async store(req, res) {
    await Exit.create({ ...req.body, date: moment(req.body.date).format() });

    return res.redirect("/exits");
  }

  async edit(req, res) {
    const { id } = req.params;

    let exit = await Exit.findById(id);

    exit.formattedDate = moment(exit.date).format("YYYY-MM-DD");

    return res.render("exit/update", { exit: exit });
  }

  async update(req, res) {
    const { id } = req.params;

    await Exit.findByIdAndUpdate(
      id,
      {
        ...req.body,
        date: moment(req.body.date).format(),
      },
      { new: true }
    );

    return res.redirect("/exits");
  }

  async destroy(req, res) {
    const { id } = req.params;

    await Exit.findByIdAndRemove(id);

    return res.redirect("/exits");
  }
}

module.exports = new ExitController();
