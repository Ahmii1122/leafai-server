const express = require("express");
const cors = require("cors");
const { resolve } = require("path");
require("dotenv").config({ path: "./.env" });

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});

// ✅ Firebase setup
const admin = require("firebase-admin");
const serviceAccount = require("./firebase-adminsdk.json"); // 🔥 Add your Firebase Admin SDK JSON file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://leafai-e8118-default-rtdb.firebaseio.com",
});

const db = admin.database();

// ✅ Fetch Stripe config
app.get("/config", (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// ✅ Create Payment Intent with Firebase price
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { userId, amount } = req.body; // ✅ Get userId & amount from request

    if (!userId || !amount) {
      return res.status(400).send({ error: "User ID and amount are required" });
    }

    // ✅ Create Payment Intent with fixed payment methods
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "EUR",
      amount, // ✅ Use amount from frontend
      automatic_payment_methods: { enabled: true }, // ✅ Disable auto methods
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (e) {
    console.error("❌ Error creating payment intent:", e);
    res.status(400).send({ error: { message: e.message } });
  }
});

// ✅ Start Server
const PORT = 5252;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
