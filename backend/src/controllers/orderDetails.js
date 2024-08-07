const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

const orderDetailSchema = require('../models/orderDetailsModels');

//const productRoutes = require('express').Router();

// Firestore database reference
const db = admin.firestore();


// get order details
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('orderDetails').get();
        const orderDetails = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(orderDetails);
    } catch (error) {
        console.error('Error getting order details:', error);
        res.status(500).send('Error getting order details');
    }
});

// post route for order details
router.post('/create-order-details', async (req, res) => {
    const { error, value: orderDetails } = orderDetailSchema.validate(req.body);

console.log("Request Body:", req.body); // Log the request body
console.log("Validation Result:", orderDetails); // Log the validation result

if (error) {
    console.error('Validation Error:', error.details[0].message); // Log the validation error
    return res.status(400).json({ error: error.details[0].message });
}

try {
    const newOrderDetailRef = db.collection('orderDetails').doc();
    await newOrderDetailRef.set(orderDetails);
    res.status(201).json({ message: 'Order details created successfully', orderDetails: orderDetails });
} catch (error) {
    console.error('Error creating order details:', error);
    res.status(500).send('Error creating order details');
}
});


module.exports = router;