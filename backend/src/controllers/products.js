const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

const productSchema = require('../models/productModels');

//const productRoutes = require('express').Router();

// Firestore database reference
const db = admin.firestore();


// route to give product detail
router.get('/:productId', async (req, res) => {
    try {
        const product = await
            db.collection('products').doc(req.params.productId).get();
        if (!product.exists) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product.data());
    } catch (error) {
        console.error('Error getting product:', error);
        res.status(500).send('Error getting product');
    }
}
);




router.post('/', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).send('Error creating product');
    }
}
);



module.exports = router;