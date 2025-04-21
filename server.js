import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js"; // MongoDB connection
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/payment", paymentRoutes);

connectDB(); // Connect MongoDB
// If using MySQL, no need to call connectDB()

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
