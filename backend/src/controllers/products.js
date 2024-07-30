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

// Route to get all products
router.get('/', async (req, res) => {
    try {
        const products = [];
        const snapshot = await db.collection('products').get();
        snapshot.forEach((doc) => {
            let product = doc.data();
            product.productId = doc.id;
            products.push(product);
        });
        res.json(products);
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).send('Error getting products');
    }
});


// Route to create a new product
router.post('/create-product', async (req, res) => {
    const { error, value } = productSchema.validate(req.body);


    // add these fields to the value

    // dateAdded = new Date(now()).toISOString()
// rating = 0;
// totalSales = 0

    value.dateAdded = new Date().toISOString();
    value.rating = 0;
    value.totalSales = 0;

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        const newProductRef = db.collection('products').doc();
        await newProductRef.set(value);
        res.status(201).json({ message: 'Product created successfully', product: value });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).send('Error creating product');
    }
}
);



module.exports = router;