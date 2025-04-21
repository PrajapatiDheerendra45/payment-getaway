import express from "express";
import { createOrder, getAllOrder, verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.get("/transactions", getAllOrder);

export default router;
