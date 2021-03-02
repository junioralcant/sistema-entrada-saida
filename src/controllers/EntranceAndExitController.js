const { formatToTimeZone } = require("date-fns-timezone");
const moment = require("moment");
const Entrance = require("../models/Entrance");
const Exit = require("../models/Exit");

class EntranceAndExitController {
  async index(req, res) {
    let items = {
      entrances: [],
      exits: [],
      totalEntrance: 0,
      totalExit: 0,
      balance: 0,
    };

    const filtersEntrance = {};
    const filtersExit = {};

    const { startDate, finalDate } = req.body;

    let dateFilter = false;

    if (startDate || finalDate) {
      dateFilter = true;

      filtersEntrance.createdAt = {};
      filtersExit.date = {};

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

      filtersEntrance.createdAt.$gte = startDate;
      filtersEntrance.createdAt.$lte = finalDate;

      filtersExit.date.$gte = startDate;
      filtersExit.date.$lte = finalDate;
    }

    let entrances = await Entrance.paginate(filtersEntrance, {
      page: req.query.page || 1,
      limit: parseInt(req.query.limit_page) || 2000,
      sort: "-createdAt",
    });

    let exits = await Exit.paginate(filtersExit, {
      page: req.query.page || 1,
      limit: parseInt(req.query.limit_page) || 2000,
      sort: "-date",
    });

    if (!startDate || !finalDate) {
      entrances = entrances.docs.map((entrance) => {
        if (
          moment(String(entrance.createdAt)).format("YYYY-MM-DD") ===
          moment(String(Date(Date.now))).format("YYYY-MM-DD")
        ) {
          return entrance;
        }
      });

      exits = exits.docs.map((exit) => {
        if (
          moment(String(exit.createdAt)).format("YYYY-MM-DD") ===
          moment(String(Date(Date.now))).format("YYYY-MM-DD")
        ) {
          return exit;
        }
      });
    }

    if (!startDate || !finalDate) {
      entrances.map((entrance) => {
        if (entrance) {
          items.entrances.push(entrance);
          items.totalEntrance += entrance.value;
        }
      });

      exits.map((exit) => {
        if (exit) {
          items.exits.push(exit);
          items.totalExit += exit.value;
        }
      });
    } else {
      entrances.docs.map((entrance) => {
        if (entrance) {
          items.entrances.push(entrance);
          items.totalEntrance += entrance.value;
        }
      });

      exits.docs.map((exit) => {
        if (exit) {
          items.exits.push(exit);
          items.totalExit += exit.value;
        }
      });
    }

    items.balance = items.totalEntrance - items.totalExit;
    return res.render("entranceandexitdatails/list", {
      items: items,
      dateFilter: dateFilter,
    });
  }
}

module.exports = new EntranceAndExitController();
