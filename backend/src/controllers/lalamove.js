const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const SDKClient = require("@lalamove/lalamove-js");
const sdkClient = require('../config/lalamove-config'); // Import the sdkClient

// Firestore database reference
const db = admin.firestore();


// Webhook route (add this to your apiRouter or app directly)
router.post('/getQuotation', async (req, res) => {
    // Log the request headers and body
    console.log('Webhook received!');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    const value = req.body;

    const stop1 = {
        "coordinates": req.body.co1,
        "address": req.body.address1
    };

    const stop2 = {
        "coordinates": req.body.co2,
        "address": req.body.address2
    };



    const quotationPayload = SDKClient.QuotationPayloadBuilder.quotationPayload()
        .withLanguage("en_PH")          // Specifies the language for responses
        .withServiceType("MOTORCYCLE")     // Specifies the type of service (e.g., courier, truck)
        .withStops([stop1, stop2])      // Defines the pickup and delivery stops
        .build();


        try {
            const quotation = await sdkClient.Quotation.create("PH", quotationPayload);
            // Respond to the service that sent the webhook
            res.status(200).json({ message: 'Computed successfully!' ,shippingFee:quotation.priceBreakdown.total });
        } catch (error) {
            console.error('Error creating quotation:', error);
            res.status(500).json({ message: 'Failed to create quotation', error });
        }
  
    // Respond to the service that sent the webhook
    res.status(200).json({ message: 'quotation successful!' });
  });



  

module.exports = router;
