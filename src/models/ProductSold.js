const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const ProductSoldSchema = new mongoose.Schema({
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      amount: Number,
      value: Number,
    },
  ],
  totalValue: {
    type: Number,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ProductSoldSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("ProductSold", ProductSoldSchema);
