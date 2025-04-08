const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// Firestore database reference
const db = admin.firestore();

// Webhook endpoint for Xendit
router.post("/xendit", (req, res) => {
  console.log("📩 Xendit Webhook Received!");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);

  // You can perform actions here based on the webhook type
  const { event, data } = req.body;

  if (!event || !data) {
    return res.status(400).json({ message: "Invalid webhook format" });
  }

  // Optional: Add logic to handle specific events
  switch (event) {
    case "ewallet.payment_succeeded":
      console.log("✅ Payment success for external_id:", data.external_id);
      // Example: Update Firestore or mark order as paid
      break;

    case "ewallet.payment_failed":
      console.log("❌ Payment failed:", data);
      break;

    default:
      console.log("ℹ️ Unhandled event:", event);
  }

  res.status(200).json({ message: "Xendit webhook received successfully" });
});

// Webhook route (add this to your apiRouter or app directly)
router.post("/lalamove", (req, res) => {
  // Log the request headers and body
  console.log("Webhook received!");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);

  // Respond to the service that sent the webhook
  res.status(200).json({ message: "Webhook received successfully!" });
});

module.exports = router;
