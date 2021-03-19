const moment = require("moment");
const Exit = require("../models/Exit");
const formatCurrency = require("../lib/formatCurrency");

class ExitController {
  async index(req, res) {
    const filters = {};

    let total = 0;

    const { startDate, finalDate } = req.body;

    if (startDate || finalDate) {
      filters.date = {};

      const startDate = moment(req.body.startDate).format(
        "YYYY-MM-DDT00:mm:ss.SSSZ"
      );

      const finalDate = moment(req.body.finalDate).format(
        "YYYY-MM-DDT23:59:ss.SSSZ"
      );

      filters.date.$gte = startDate;
      filters.date.$lte = finalDate;
    }

    let exits = await Exit.paginate(filters, {
      page: req.query.page || 1,
      limit: parseInt(req.query.limit_page) || 2000,
      sort: "-date",
    });

    const getExitPromise = exits.docs.map(async (exit) => {
      exit.formattedDate = moment(exit.date).format("DD-MM-YYYY");
      exit.formattedValue = formatCurrency.brl(exit.value);

      return exit;
    });

    exits = await Promise.all(getExitPromise);

    let dateFilter = false;

    if (startDate || finalDate) {
      exits.map((exit) => {
        dateFilter = true;
        total += exit.value;
      });
    }

    if (!startDate || !finalDate) {
      exits = exits.map((exit) => {
        if (moment(exit.date).month() === moment(Date.now()).month()) {
          total += exit.value;
          return exit;
        }
      });
    }

    let exitsFilter = [];

    exits.map((exit) => {
      if (exit != undefined) exitsFilter.push(exit);
    });

    return res.render("exit/list", {
      exits: exitsFilter,
      total: formatCurrency.brl(total),
      dateFilter: dateFilter,
      startDate,
      finalDate,
    });
  }

  async store(req, res) {
    const { descriptionExit, value, date } = req.body;

    let total = 0;

    if (!descriptionExit || !value || !date) {
      let exits = await Exit.find().sort("-date");

      const getExitPromise = exits.map(async (exit) => {
        exit.formattedDate = moment(exit.date).format("DD-MM-YYYY");
        exit.formattedValue = formatCurrency.brl(exit.value);

        return exit;
      });

      exits = await Promise.all(getExitPromise);

      let dateFilter = false;

      exits = exits.map((exit) => {
        if (moment(exit.date).month() === moment(Date.now()).month()) {
          total += exit.value;
          return exit;
        }
      });

      let exitsFilter = [];

      exits.map((exit) => {
        if (exit != undefined) exitsFilter.push(exit);
      });

      return res.render("exit/list", {
        exits: exitsFilter,
        total: formatCurrency.brl(total),
        dateFilter: dateFilter,
        value,
        descriptionExit,
        date: moment(date).format("YYYY-MM-DD"),
        message: "Preencha os campos obrigatórios (*) para continuar!",
      });
    }

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
    const { descriptionExit, value, date } = req.body;

    if (!descriptionExit || !value || !date) {
      let exit = await Exit.findById(id);

      exit.formattedDate = moment(exit.date).format("YYYY-MM-DD");

      return res.render("exit/update", {
        exit: exit,
        message: "Preencha os campos obrigatórios (*) para continuar!",
      });
    }

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
