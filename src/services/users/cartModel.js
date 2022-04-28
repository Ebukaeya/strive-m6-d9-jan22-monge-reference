import mongoose from "mongoose"

const { Schema, model } = mongoose

const CartsSchema = new Schema(
  {
    owner: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    status: { type: String, required: true, enum: ["Active", "Paid"] },
    products: [{ productId: { type: mongoose.Types.ObjectId, ref: "Book" }, quantity: Number, _id: false }],
  },
  { timestamps: true }
)

export default model("Cart", CartsSchema)
