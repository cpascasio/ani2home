const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
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

// route to get products given userId
router.get('/user/:userId', async (req, res) => {
    try {
        const products = [];
        const snapshot = await db.collection('products').where('storeId', '==', req.params.userId).get();
        snapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });
        res.json(products);
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).send('Error getting products');
    }
});

// Route to get the product detail given productId and the seller details
router.get('/product/:productId', async (req, res) => {
    try {
        const productDoc = await db.collection('products').doc(req.params.productId).get();
        if (!productDoc.exists) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const productData = productDoc.data();
        productData.id = productDoc.id; // Add the document ID to the product data

        const sellerDoc = await db.collection('users').doc(productData.storeId).get();
        res.json({ product: productData, seller: sellerDoc.data() });
    } catch (error) {
        console.error('Error getting product:', error);
        res.status(500).send('Error getting product');
    }
});

// Route to get the products of a specific seller and the seller details
router.get('/seller/:sellerId', async (req, res) => {
    try {
        const products = [];
        const snapshot = await db.collection('products').where('storeId', '==', req.params.sellerId).get();
        snapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });

        const sellerDoc = await db.collection('users').doc(req.params.sellerId).get();
        res.json({ products, seller: sellerDoc.data() });
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).send('Error getting products');
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

// Route to get products category
router.get('/category/:categ', async (req, res) => {
    const { categ } = req.params;
    console.log('Received category:', categ); // Added for debugging
    try {
        const products = [];
        let snapshot;

        if (categ === 'fruits' || categ === 'Fruits') {
            snapshot = await db.collection('products').where('category', '==', 'Fruit').get();
            console.log('Fetched fruits'); // Added for debugging
        } else if (categ === 'vegetables' || categ === 'Vegetables') {
            snapshot = await db.collection('products').where('category', '==', 'Vegetable').get();
            console.log('Fetched vegetables'); // Added for debugging
        } else if (categ === 'artisanal food' || categ === 'Artisanal Food') {
            snapshot = await db.collection('products').where('category', '==', 'Artisinal Food').get();
            console.log('Fetched artisinal food'); // Added for debugging
        } else {
            snapshot = await db.collection('products').get();
            console.log('Fetched all products'); // Added for debugging
        }

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
        // Check if pictures exist and is an array
        if (value.pictures) {
            const uploadPromises = value.pictures.map(async (picture) => {
                const result = await cloudinary.uploader.upload(picture, {
                    folder: 'ani2home',
        resource_type: 'image' // Optional: if you have an upload preset
                });
                return result.secure_url;
            });

            // Wait for all uploads to complete
            value.pictures = await Promise.all(uploadPromises);
        }

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