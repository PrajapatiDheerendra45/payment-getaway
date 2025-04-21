import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import Order from "../models/Order.js"; // For MongoDB


dotenv.config();

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Order
export const createOrder = async (req, res) => {
    try {
        const { amount, currency } = req.body;

        const options = {
            amount: amount * 100, // Razorpay accepts amount in paise
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpayInstance.orders.create(options);

        // Save to DB (MongoDB)
        const newOrder = new Order({
            razorpay_order_id: order.id,
            amount,
            currency,
        });
        await newOrder.save();

        // Save to DB (MySQL)
        // createOrder({ razorpay_order_id: order.id, amount, currency }, (err, result) => {
        //     if (err) return res.status(500).json({ success: false, message: err.message });
        // });

        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error });
    }
};

export const getAllOrder = async (req, res) => {
    try {
        const ordersResponse = await Order.find(); // Await the database query
        res.status(200).json({
            success: true,
            message: "All orders fetched successfully!",
            orders: ordersResponse, // Fix response key from `order` to `orders`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verify Payment
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        // Update in MongoDB
        await Order.findOneAndUpdate(
            { razorpay_order_id },
            { razorpay_payment_id, razorpay_signature, status: "paid" }
        );

        // Update in MySQL
        // updateOrder({ razorpay_order_id, razorpay_payment_id, razorpay_signature }, (err, result) => {
        //     if (err) return res.status(500).json({ success: false, message: err.message });
        // });

        res.json({ success: true, message: "Payment verified successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
