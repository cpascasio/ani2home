const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

const orderSchema = require('../models/orderModels');

//const productRoutes = require('express').Router();

// Firestore database reference
const db = admin.firestore();

// route for post order
router.post('/create-order', async (req, res) => {
    const { error, value } = orderSchema.validate(req.body);

    if (error) {
        console.error('Validation Error:', error.details[0].message); // Log the validation error
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        const newOrderRef = db.collection('orders').doc();
        await newOrderRef.set(value);
        res.status(201).json({ message: 'Order created successfully', order: value });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).send('Error creating order');
    }
});


module.exports = router;