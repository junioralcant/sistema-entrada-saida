const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const EntranceSchema = new mongoose.Schema({
  sale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sale",
  },

  value: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

EntranceSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Entrance", EntranceSchema);
