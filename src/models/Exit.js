const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const ExitSchema = new mongoose.Schema({
  descriptionExit: String,

  value: {
    type: Number,
    required: true,
  },

  date: {
    type: Date,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ExitSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Exit", ExitSchema);
