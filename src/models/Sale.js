const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const SaleSchema = new mongoose.Schema({
  sale: {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: Number,
        price: Number,
      },
    ],
    descount: Number,
    total: Number,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

SaleSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Sale", SaleSchema);
