const moment = require("moment");
const Entrance = require("../models/Entrance");

class EntranceController {
  async index(req, res) {
    let entrances = await Entrance.find().sort("-createdAt").populate("sale");

    const getEntrancePromise = entrances.map(async (entrance) => {
      entrance.formattedDate = moment(entrance.date).format("DD-MM-YYYY");

      return entrance;
    });

    entrances = await Promise.all(getEntrancePromise);

    return res.render("entrance/list", { entrances: entrances });
  }
}

module.exports = new EntranceController();
