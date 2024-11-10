
let mongoose = require("mongoose");

let OrderSchema = new mongoose.Schema(

  

  {
    NumberOrder:{
      type:String,
      required:true
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
  
    products: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "product",
        },
        quantity:Number
      },
    ],
    
    totalQty: {
        type: Number,
      },
    totalPrice: {
        type: Number,
      },
     

    etat: {
      type: String,
      default: "Submitted",
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("order", OrderSchema);
