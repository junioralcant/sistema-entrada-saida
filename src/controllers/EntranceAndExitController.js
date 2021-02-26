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

    const entrances = await Entrance.find();
    const exits = await Exit.find();

    entrances.map((entrance) => {
      items.entrances.push(entrance);
      items.totalEntrance += entrance.value;
    });

    exits.map((exit) => {
      items.exits.push(exit);
      items.totalExit += exit.value;
    });

    items.balance = items.totalEntrance - items.totalExit;

    return res.render("entranceandexit/list", { items: items });
  }
}

module.exports = new EntranceAndExitController();
