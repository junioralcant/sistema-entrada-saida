const moment = require("moment");
const { formatToTimeZone } = require("date-fns-timezone");
const Exit = require("../models/Exit");

class ExitController {
  async index(req, res) {
    const filters = {};

    let total = 0;

    const { startDate, finalDate } = req.body;

    if (startDate || finalDate) {
      filters.date = {};

      const startDate = formatToTimeZone(
        req.body.startDate,
        "YYYY-MM-DDT00:mm:ss.SSSZ", // formatação de data e hora
        {
          timeZone: "America/Sao_Paulo",
        }
      );

      const finalDate = formatToTimeZone(
        req.body.finalDate,
        "YYYY-MM-DDT23:59:ss.SSSZ", // formatação de data e hora
        {
          timeZone: "America/Sao_Paulo",
        }
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
        if (
          moment(String(exit.date)).format("YYYY-MM-DD") ===
          moment(String(Date(Date.now))).format("YYYY-MM-DD")
        ) {
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
      total: total,
      dateFilter: dateFilter,
    });
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
