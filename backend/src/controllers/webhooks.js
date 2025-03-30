const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// Firestore database reference
const db = admin.firestore();

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
