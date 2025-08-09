const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// Firestore database reference
const db = admin.firestore();

// Webhook endpoint for Xendit
router.post("/xendit", async (req, res) => {
  console.log("📩 Xendit Webhook Received!");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);

  const { event, data } = req.body; // Get status from the body

  // Check if event and data are present in the request body
  if (!event || !data) {
    return res.status(400).json({ message: "Invalid request" });
  }

  // Extract reference_id and id from the request body
  const { reference_id, id, status } = data; // Adjust based on actual webhook payload structure

  // Ensure reference_id and id exist in the data
  if (!reference_id || !id) {
    return res.status(400).json({ message: "Missing reference_id or id" });
  }

  try {
    // Only proceed if the status is "SUCCEEDED"
    if (status === "SUCCEEDED") {
      // Access the 'orders' collection and find the document with reference_id
      const orderDocRef = db.collection("orders").doc(reference_id);
      const orderDoc = await orderDocRef.get();

      if (!orderDoc.exists) {
        return res.status(404).json({
          message: `Order with reference_id ${reference_id} not found`,
        });
      }

      // Update the order document with the paymentRefNo
      await orderDocRef.update({
        paymentRefNo: id, // Set the paymentRefNo attribute with the 'id' from the webhook
        status: "Paid",
      });

      console.log(
        `✅ Order with reference_id ${reference_id} updated with paymentRefNo: ${id}`
      );
    } else {
      console.log("ℹ️ Payment status is not SUCCEEDED. Skipping update.");
    }

    // Handle different events from the Xendit webhook
    switch (event) {
      case "ewallet.capture":
        console.log("✅ Payment success for external_id:", data.external_id);
        break;

      case "ewallet.payment_failed":
        console.log("❌ Payment failed:", data);
        break;

      default:
        console.log("ℹ️ Unhandled event:", event);
    }

    // Respond with success status
    res.status(200).json({ message: "Xendit webhook received successfully" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res
      .status(500)
      .json({ message: "Error processing webhook", error: error.message });
  }
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
