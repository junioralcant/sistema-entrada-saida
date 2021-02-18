const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  salePrice: {
    type: Number,
    required: true,
  },

  productCode: {
    type: String,
    required: true,
  },

  expirationDate: {
    type: Date,
  },

  formattedExpirationDate: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ProductSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Product", ProductSchema);
