const moment = require("moment");
const Entrance = require("../models/Entrance");
const formatCurrency = require("../lib/formatCurrency");

class EntranceController {
  async index(req, res) {
    const filters = {};

    let total = 0;

    const { startDate, finalDate } = req.body;

    if (startDate || finalDate) {
      filters.createdAt = {};

      const startDate = moment(req.body.startDate).format(
        "YYYY-MM-DDT00:mm:ss.SSSZ"
      );

      const finalDate = moment(req.body.finalDate).format(
        "YYYY-MM-DDT23:59:ss.SSSZ"
      );

      filters.createdAt.$gte = startDate;
      filters.createdAt.$lte = finalDate;
    }

    let entrances = await Entrance.paginate(filters, {
      page: req.query.page || 1,
      limit: parseInt(req.query.limit_page) || 2000,
      populate: ["sale"],
      sort: "-createdAt",
    });

    const getEntrancePromise = entrances.docs.map(async (entrance) => {
      entrance.formattedDate = moment(entrance.createdAt).format("DD-MM-YYYY");
      entrance.formattedValue = formatCurrency.brl(entrance.value);
      return entrance;
    });

    entrances = await Promise.all(getEntrancePromise);

    let dateFilter = false;

    if (startDate || finalDate) {
      dateFilter = true;
      entrances.map((entrance) => {
        total += entrance.value;
      });
    }

    if (!startDate || !finalDate) {
      entrances = entrances.map((entrance) => {
        if (moment(entrance.createdAt).month() === moment(Date.now()).month()) {
          total += entrance.value;
          return entrance;
        }
      });
    }

    let entrancesFilter = [];

    entrances.map((sale) => {
      if (sale != undefined) entrancesFilter.push(sale);
    });

    return res.render("entrance/list", {
      entrances: entrancesFilter,
      total: formatCurrency.brl(total),
      dateFilter: dateFilter,
      startDate,
      finalDate,
    });
  }
}

module.exports = new EntranceController();
