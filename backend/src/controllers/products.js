const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

const productSchema = require('../models/productModels');

// Firestore database reference
const db = admin.firestore();

// Route to get product detail
router.get('/:productId', async (req, res) => {
    try {
        const product = await db.collection('products').doc(req.params.productId).get();
        if (!product.exists) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product.data());
    } catch (error) {
        console.error('Error getting product:', error);
        res.status(500).send('Error getting product');
    }
});

// Route to get all products
router.get('/', async (req, res) => {
    try {
        const products = [];
        const snapshot = await db.collection('products').get();
        snapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
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

    // Add these fields to the value
    value.dateAdded = new Date().toISOString();
    value.rating = 0;
    value.totalSales = 0;

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        const newProductRef = db.collection('products').doc();
        await newProductRef.set(value);
        res.status(201).json({ 
            message: 'Product created successfully', 
            product: { 
                ...value, 
                productId: newProductRef.id // Include the document ID
            } 
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).send('Error creating product');
    }
});

// Route to update a product
router.put('/:productId', async (req, res) => {
    const { error, value } = productSchema.validate(req.body);
    console.log("🚀 ~ router.put ~ value:", value)

    

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        const productRef = db.collection('products').doc(req.params.productId);
        await productRef.update(value);
        res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Error updating product');
    }
});

// Route to delete a product
router.delete('/:productId', async (req, res) => {
    try {
        const productRef = db.collection('products').doc(req.params.productId);
        await productRef.delete();
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send('Error deleting product');
    }
});

module.exports = router;