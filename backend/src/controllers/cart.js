const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();


const cartSchema = require('../models/cartModels');

//const productRoutes = require('express').Router();

// Firestore database reference
const db = admin.firestore();

// route to give product detail
router.get('/:userId', async (req, res) => {

    const { userId } = req.params;

    try {
        const doc = await db.collection('cart').doc(userId).get();

        if (!doc.exists) {
            return res.status(404).send('Cart not found');
        }

        const cartData = doc.data().cart;
        console.log("🚀 ~ router.get ~ cartData:", cartData);

        res.json(cartData);

    } catch (error) {
        console.error('Error getting cart:', error);
        res.status(500).send('Error getting cart');
    }
});


// route to give product detail
router.get('/:userId/:sellerId', async (req, res) => {
    try {
        const { userId, sellerId } = req.params;
        const userCartDoc = await db.collection('cart').doc(userId).get();

        if (!userCartDoc.exists) {
            return res.status(404).send('Cart not found');
        }

        const cartData = userCartDoc.data().cart || [];
        const filteredCart = cartData.filter(item => item.sellerId === sellerId);


        console.log('Filtered cart:', filteredCart);

        res.json(filteredCart);
    } catch (error) {
        console.error('Error getting cart:', error);
        res.status(500).send('Error getting cart');
    }
});

router.get('/checkout/:userId/:sellerId', async (req, res) => {
    const { sellerId } = req.params;
    const { userId } = req.params;

    try {
        const value = await db.collection('cart').doc(userId).get();

        // check .cart[].sellerId === sellerId and return cart[].items
        const cart = value.data().cart.filter(item => item.sellerId === sellerId);

        if (cart.length > 0) {
            const result = cart[0]; // Get the first element
            console.log('Cart:', result);



            // check the productId of each item in the cart and get the price from the products collection
            for (let item of result.items) {
                const product = await db.collection('products').doc(item.productId).get();
                // add all product details to the item
                item.product = product.data();

            }

            // check user details get the address.lat and lng
            const user = await db.collection('users').doc(sellerId).get();
            result.seller = user.data();
            
            res.json(result);
        } else {
            res.status(404).send('No items found for the given sellerId');
        }
    } catch (error) {
        console.error('Error getting cart items:', error);
        res.status(500).send('Error getting cart items');
    }
});

// Route to add to cart
router.post('/add-to-cart', async (req, res) => {
    // add to cart collections given productId in req

    const { userId, sellerId, productId, quantity } = req.body;

    console.log('Request body:', req.body);

    try {
        const userCartDoc = await db.collection('cart').doc(userId).get();

        console.log('User cart doc:', userCartDoc.data());

        let cartData = [];
        if (userCartDoc.exists) {
            cartData = userCartDoc.data().cart || [];
        }

        let sellerExists = false;
        if (cartData.length > 0) {
            for (let seller of cartData) {
                if (seller.sellerId === sellerId) {
                    seller.items.push({ productId, quantity });
                    sellerExists = true;
                    break;
                }
            }
        }

        if (!sellerExists) {
            cartData.push({
                sellerId,
                items: [{ productId, quantity }]
            });
        }

        await db.collection('cart').doc(userId).set({ cart: cartData }, { merge: true });


        console.log('Cart updated in Firestore');

        res.status(201).json({ message: 'Product added to cart successfully', cart: cartData });
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

