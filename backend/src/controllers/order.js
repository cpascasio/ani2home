const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const placeOrderSchema = require('../models/placeOrderModels');
const orderDetailsSchema = require('../models/orderDetailsModels');
const orderSchema = require('../models/orderModels');

//const productRoutes = require('express').Router();

// Firestore database reference
const db = admin.firestore();



router.post('/place-order', async (req, res) => {

    console.log("Place Order Route: ", req.body);

    const { error, value } = placeOrderSchema.validate(req.body);

    // Destructure req.body to separate items and the rest of the data
    const { items, ...order } = value;


    if (error) {
        console.error('Validation Error:', error.details[0].message); // Log the validation error
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        const newOrderRef = db.collection('orders').doc();
        await newOrderRef.set(order);
        const orderId = newOrderRef.id;

        const orderDetails = value.items.map((item) => {
            return { ...item, orderId: orderId };
        });

        console.log("🚀 ~ orderDetails ~ orderDetails:", orderDetails);        

        let validationErrors = [];

        orderDetails.forEach((item, index) => {
            const { error, value } = orderDetailsSchema.validate(item);
            if (error) {
                console.error(`Validation Error in item ${index}:`, error.details[0].message); // Log the validation error
                validationErrors.push(`Item ${index}: ${error.details[0].message}`);
            } else {
                // If needed, you can update the item with validated values
                orderDetails[index] = value;
            }
        });
        
        if (validationErrors.length > 0) {
            return res.status(400).json({ errors: validationErrors });
        }
        // Create a batch
        const batch = db.batch();
        orderDetails.forEach((orderDetail) => {
            const orderDetailRef = db.collection('orderDetails').doc();
            batch.set(orderDetailRef, orderDetail);

        });
        await batch.commit();
    
        res.status(201).json({ message: 'Order created successfully', order: order, orderDetails:orderDetails, orderId: orderId });
        console.log("Order Id from order route: ", orderId);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).send('Error creating order');
    }
});


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
        const orderId = newOrderRef.id;
        res.status(201).json({ message: 'Order created successfully', order: value, orderId: orderId });
        console.log("Order Id from order route: ", orderId);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).send('Error creating order');
    }
});

// route to get order
// router.get('/:userId', async (req, res) => {
//     try {
//         const snapshot = await db.collection('orders').where('userId', '==', req.params.userId).get();
//         const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//         res.status(200).json(orders);
//     } catch (error) {
//         console.error('Error getting orders:', error);
//         res.status(500).send('Error getting orders');
//     }
// });
// route to get order
router.get('/:userId', async (req, res) => {
    try {
        const snapshot = await db.collection('orders').where('userId', '==', req.params.userId).get();
        const orders = snapshot.docs.map((doc) => ({ orderId: doc.id, ...doc.data() }));
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error getting orders:', error);
        res.status(500).send('Error getting orders');
    }
});


module.exports = router;