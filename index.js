import React, { useState } from "react";
import { FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentUI = () => {
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!phone) {
      alert("Please enter your phone number.");
      return;
    }

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("Failed to load Razorpay SDK.");
      return;
    }

    try {
      // Request backend to create an order
      const { data } = await axios.post("http://localhost:5000/api/payment/create-order", {
        amount: 6000 * 100, // Razorpay uses amount in paise (₹6000 -> 600000)
        currency: "INR",
      });

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Set this in .env
        amount: data.order.amount,
        currency: "INR",
        name: "Acme Corp",
        description: "Secure Payment",
        order_id: data.order.id,
        prefill: {
          contact: phone,
        },
        theme: { color: "#1A56DB" },
        handler: async function (response) {
          navigate(`/payment-details/${response.razorpay_payment_id}`, {
            state: {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              amount: 6000,
            },
          });
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment failed", error);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-96 bg-blue-600 rounded-xl text-white p-6 shadow-lg relative">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-800 flex items-center justify-center rounded-full text-2xl font-bold">
            A
          </div>
          <h2 className="mt-2 text-xl font-semibold">Acme Corp</h2>
          <div className="bg-green-600 text-xs px-2 py-1 rounded-full mt-2 flex items-center">
            <span className="ml-1">✅ Razorpay Trusted Business</span>
          </div>
          <p className="mt-4 text-lg">Total Amount</p>
          <p className="text-3xl font-bold">₹6,000</p>
          <div className="flex items-center mt-2 text-sm opacity-80">
            <FiLock className="mr-1" /> Secured by <b className="ml-1">Razorpay</b>
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-white text-gray-900 mt-6 p-4 rounded-xl shadow-md">
          <p className="text-sm font-medium">Contact Details</p>
          <div className="mt-2 flex items-center border rounded-lg px-3 py-2">
            <span className="mr-2 text-gray-500">+91</span>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="w-full focus:outline-none"
            />
          </div>
        </div>

        {/* Proceed Button */}
        <button
          onClick={handlePayment}
          className="mt-4 w-full bg-blue-800 hover:bg-blue-900 text-white py-3 rounded-lg text-lg font-medium transition"
        >
          Proceed
        </button>
      </div>
    </div>
  );
};

export default PaymentUI;
