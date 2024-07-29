const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

const cartSchema = require('../models/cartModels');

//const productRoutes = require('express').Router();

// Firestore database reference
const db = admin.firestore();

// route to give product detail
router.get('/:userId', async (req, res) => {
    try {
        const cart = [];
        const snapshot = await db.collection('cart').where('userId', '==', req.params.userId).get();
        snapshot.forEach((doc) => {
            cart.push(doc.data());
        });
        res.json(cart);
    } catch (error) {
        console.error('Error getting cart:', error);
        res.status(500).send('Error getting cart');
    }
}
);

// Route to add to cart
router.post('/add-to-cart', async (req, res) => {
    // add to cart collections given productId in req

    console.log(req.body);

    const { error, value } = cartSchema.validate(req.body);

    console.log(value);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    try {
        const newCartRef = db.collection('cart').doc();
        await newCartRef.set(value);
        res.status(201).json({ message: 'Product added to cart successfully', product: value });
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).send('Error adding product to cart');
    }
    });

// route to get the cart items & the product details for that cart item
// router.get('/cart-items/:userId', async (req, res) => {
//     try {
//         const cart = [];
//         const snapshot = await db.collection('cart').where('userId', '==', req.params.userId).get();
//         snapshot.forEach(async (doc) => {
//             const product = await db.collection('products').doc(doc.data().productId).get();
//             cart.push({ ...doc.data(), product: product.data() });
//         });
//         res.json(cart);
//     } catch (error) {
//         console.error('Error getting cart items:', error);
//         res.status(500).send('Error getting cart items');
//     }
// });
router.get('/cart-items/:userId', async (req, res) => {
    try {
        const cart = [];
        const snapshot = await db.collection('cart').where('userId', '==', req.params.userId).get();
        
        const promises = snapshot.docs.map(async (doc) => {
            const product = await db.collection('products').doc(doc.data().productId).get();
            cart.push({ ...doc.data(), product: product.data() });
        });

        await Promise.all(promises);

        res.json(cart);
    } catch (error) {
        console.error('Error getting cart items:', error);
        res.status(500).send('Error getting cart items');
    }
});


// route for remove cart items
router.delete('/remove-from-cart', async (req, res) => {
    // remove cart item from cart collection given userId and productId in req
    try {
        const snapshot = await db.collection('cart').where('userId', '==', req.body.userId).where('productId', '==', req.body.productId).get();
        snapshot.forEach(async (doc) => {
            await db.collection('cart').doc(doc.id).delete();
        });
        res.json({ message: 'Product removed from cart' });
    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).send('Error removing product from cart');
    }
});



module.exports = router;

