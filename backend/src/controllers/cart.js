const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const { logger, logToFirestore } = require('../config/firebase-config');

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

        // Fetch seller details for each cart item
        const cartWithSellerDetails = await Promise.all(cartData.map(async (item) => {
            const sellerDoc = await db.collection('users').doc(item.sellerId).get();
            const sellerData = sellerDoc.exists ? sellerDoc.data() : null;
            return {
                ...item,
                seller: sellerData
            };
        }));

        res.json(cartWithSellerDetails);

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
    const { userId, sellerId, productId, quantity } = req.body;

    // Log the incoming request body
    console.log('Request body:', req.body);

    try {
        // Fetch the user's cart document from Firestore
        const userCartDoc = await db.collection('cart').doc(userId).get();

        // Log the existing cart data
        console.log('User cart doc:', userCartDoc.data());

        let cartData = [];
        if (userCartDoc.exists) {
            cartData = userCartDoc.data().cart || [];
        }

        // Log the current cart data
        console.log('Current cart data:', cartData);

        let sellerExists = false;

        // Check if the seller already exists in the cart
        if (cartData.length > 0) {
            for (let seller of cartData) {
                if (seller.sellerId === sellerId) {
                    // Add the product to the seller's items
                    seller.items.push({ productId, quantity });
                    sellerExists = true;
                    break;
                }
            }
        }

        // If the seller doesn't exist, add a new seller entry
        if (!sellerExists) {
            cartData.push({
                sellerId,
                items: [{ productId, quantity }]
            });
        }

        // Log the updated cart data
        console.log('Updated cart data:', cartData);

        // Save the updated cart data to Firestore
        await db.collection('cart').doc(userId).set({ cart: cartData }, { merge: true });

        // Log success
        console.log('Cart updated in Firestore');

        // Create logData for successful operation
        const logData = {
            timestamp: new Intl.DateTimeFormat('en-PH', {
                timeZone: 'Asia/Manila',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            }).format(new Date()),
            userId,
            action: 'add_to_cart',
            resource: `cart/${userId}`,
            status: 'success',
            details: {
                sellerId,
                productId,
                quantity,
            },
        };

        // Log to console/file
        logger.info(logData);

        // Log to Firestore
        await logToFirestore(logData);

        res.status(201).json({ message: 'Product added to cart successfully', cart: cartData });
    } catch (error) {
        // Log the error
        console.error('Error adding product to cart:', error);

        // Create logData for failed operation
        const logData = {
            timestamp: new Intl.DateTimeFormat('en-PH', {
                timeZone: 'Asia/Manila',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            }).format(new Date()),
            userId,
            action: 'add_to_cart',
            resource: `cart/${userId}`,
            status: 'failed',
            error: error.message,
            requestBody: req.body,
        };

        // Log to console/file
        logger.error(logData);

        // Log to Firestore
        await logToFirestore(logData);

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
    const { userId, productId } = req.body;

    // Log the incoming request body
    console.log('Request body:', req.body);

    try {
        // Get the user's cart document
        const userDocRef = db.collection('cart').doc(userId);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            // Log the error if the user is not found
            const logData = {
                timestamp: new Intl.DateTimeFormat('en-PH', {
                    timeZone: 'Asia/Manila',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                }).format(new Date()),
                userId,
                action: 'remove_from_cart',
                resource: `cart/${userId}`,
                status: 'failed',
                error: 'User not found',
                requestBody: req.body,
            };

            logger.error(logData); // Log to console/file
            await logToFirestore(logData); // Log to Firestore

            return res.status(404).send('User not found');
        }

        const cartData = userDoc.data().cart;

        // Log the entire cart data
        console.log('Cart Data:', cartData);

        // Iterate over the cart data to log each item's details
        cartData.forEach((cartEntry, index) => {
            console.log(`Cart Entry ${index + 1}:`, cartEntry);
            console.log('Seller ID:', cartEntry.sellerId);
            cartEntry.items.forEach((item, itemIndex) => {
                console.log(`  Item ${itemIndex + 1}:`, item);
                console.log('    Product ID:', item.productId);
                console.log('    Quantity:', item.quantity);
            });
        });

        // Filter out the item with the matching productId
        const updatedCart = cartData
            .map(cartEntry => {
                return {
                    ...cartEntry,
                    items: cartEntry.items.filter(item => item.productId !== productId)
                };
            })
            .filter(cartEntry => cartEntry.items.length > 0);

        // Log the updated cart data
        console.log('Updated Cart Data:', updatedCart);

        // Update the user's cart document
        await userDocRef.update({ cart: updatedCart });

        // Log success
        console.log('Product removed from cart:', productId);

        // Create logData for successful operation
        const logData = {
            timestamp: new Intl.DateTimeFormat('en-PH', {
                timeZone: 'Asia/Manila',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            }).format(new Date()),
            userId,
            action: 'remove_from_cart',
            resource: `cart/${userId}`,
            status: 'success',
            details: {
                productId,
                updatedCart,
            },
        };

        // Log to console/file
        logger.info(logData);

        // Log to Firestore
        await logToFirestore(logData);

        res.json({ message: 'Product removed from cart' });
    } catch (error) {
        // Log the error
        console.error('Error removing product from cart:', error);

        // Create logData for failed operation
        const logData = {
            timestamp: new Intl.DateTimeFormat('en-PH', {
                timeZone: 'Asia/Manila',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            }).format(new Date()),
            userId,
            action: 'remove_from_cart',
            resource: `cart/${userId}`,
            status: 'failed',
            error: error.message,
            requestBody: req.body,
        };

        // Log to console/file
        logger.error(logData);

        // Log to Firestore
        await logToFirestore(logData);

        res.status(500).send('Error removing product from cart');
    }
});

module.exports = router;
