const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const EntranceSchema = new mongoose.Schema({
  Entrance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },

  descripitionEntrance: String,

  value: {
    type: Number,
    required: true,
  },

  date: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

EntranceSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Entrance", EntranceSchema);
