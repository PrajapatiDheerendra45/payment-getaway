import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    razorpay_order_id: { type: String, required: true },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "INR" },
    status: { type: String, required: true, default: "pending" },
});

export default mongoose.model("Order", OrderSchema);
