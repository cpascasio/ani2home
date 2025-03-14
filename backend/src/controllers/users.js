const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const fs = require('fs');
const userSchema = require('../models/userModels'); // Import the userSchema
const cartSchema = require('../models/cartModels');
const cloudinary = require('../config/cloudinary');
//const userSchema = require('../models/userModels');

// Initialize Firebase Admin SDK
// Note: Ensure you've initialized Firebase Admin SDK elsewhere in your project,
// usually in your main server file, with the necessary configuration.

// Firestore database reference
const db = admin.firestore();


// GET route to fetch all users
router.get('/', async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      return res.status(404).json({ message: 'No users found', state: 'error' });
    }

    const usersList = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({
      message: 'Users retrieved successfully',
      state: 'success',
      data: usersList
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', state: 'error' });
  }
});


// POST route to create a new user
router.post('/', async (req, res) => {
  const { email, name } = req.body;
  try {
    const user = await db.collection('users').add({
      email,
      name,
    });
    res.status(201).json({ id: user.id });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Error creating user');
  }
});

const addUserToFirestore = async (value) => {
  try {
    // Extract userId from the value object
    const { userId, ...userData } = value;

    let default_var = {
      "name": "",
      "userName": "",
      "email": "",
      "dateOfBirth": "",
      "userProfilePic": "",
      "userCover": "",
      "address": {
        "fullAddress": "",
        "streetAddress": "",
        "city": "",
        "province": "",
        "barangay": "",
        "region": "",
        "country": "",
        "postalCode": "",
        "lng": 0,
        "lat": 0
      },
      "phoneNumber": "",
      "followers": [],
      "isStore": false,
      "bio": "",
      "isVerified": false
    };

    // Merge userData into default_var
    const mergedData = {
      ...default_var,
      ...userData,
      address: {
        ...default_var.address,
        ...userData.address
      }
    };

    // Add user data to Firestore, excluding the userId from the document fields
    await db.collection('users').doc(userId).set(mergedData);

    console.log('User data successfully written to Firestore');
  } catch (error) {
    console.error('Error adding user data to Firestore:', error);
  }
};

// create cart for user
const createCartForUser = async (userId) => {

  const data = {
    cart: [],
  }

  // validate the cart
  const { error, value } = cartSchema.validate(data);

  if (error) {
    console.error('Validation Error:', error.details[0].message); // Log the validation error
    throw new Error('Error creating cart for user');
  }

  try {
    // Assuming 'add' is a method to add a new document. This might need to be adjusted based on your DB API.
    await db.collection('cart').doc(userId).set(value);
    console.log('Cart created successfully');
  } catch (error) {
    console.error('Error creating cart:', error);
    throw new Error('Error creating cart for user');
  }

};



const checkUserExists = async (userId) => {
  try {
    console.log("USERID:", userId);
    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
      console.log("User exists:", userDoc.data());
      return true;
    } else {
      console.log("User does not exist");
      return false;
    }
  } catch (error) {
    console.error('Error checking user existence:', error);
    throw error;
  }


};


router.post('/create-user', async (req, res) => {
  console.log('Request body:', req.body);

  const userId = req.body.userId;

  try {
    // Check if the user already exists in Firestore
    const userExists = await checkUserExists(userId);

    if (userExists) {
      console.log('User already exists:', userId);
      return res.status(400).json({
        message: 'User already exists',
        state: 'error',
      });
    }

    // Validate the request body
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).send(error.details[0].message);
    }

    console.log('Validated request body:', value);

    // Add the user to Firestore
    await addUserToFirestore(value);
    console.log('User added to Firestore:', userId);

    // Create a cart for the user
    await createCartForUser(userId);
    console.log('Cart created for user:', userId);

    res.status(201).json({
      message: 'User created successfully',
      state: 'success',
    });
  } catch (error) {
    console.error('Error in /create-user:', error);
    res.status(500).json({
      message: 'Error creating user',
      state: 'error',
    });
  }
});


// GET route to fetch a user by UID
router.get('/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'User not found', state: 'error' });
    }
    res.status(200).json({
      message: 'User found',
      state: 'success',
      data: doc.data()
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', state: 'error' });
  }
});

/// GET route to fetch a user by UID and return the isStore attribute only
router.get('/:uid/isStore', async (req, res) => {
  const { uid } = req.params;
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'User not found', state: 'error' });
    }
    const userData = doc.data();
    res.status(200).json({
      message: 'User found',
      state: 'success',
      data: userData.isStore
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', state: 'error' });
  }
});

// PUT route to update a user by UID
router.put('/edit-user/:uid', async (req, res) => {
  const { uid } = req.params;
  const { error, value } = userSchema.validate(req.body);

  console.log("value", value);
  console.log(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found', state: 'error' });
    }

    // Extract userProfilePic from value
    const { userProfilePic, ...rest } = value;

    // Upload userProfilePic to Cloudinary if it exists
    if (userProfilePic) {
      const uploadResponse = await cloudinary.uploader.upload(userProfilePic, {
        folder: 'ani2home',
        resource_type: 'image'
      });

      // Replace userProfilePic with the URL from Cloudinary
      rest.userProfilePic = uploadResponse.secure_url;
    }

    // Update Firestore document with the modified value
    await userDocRef.update(rest);
    res.status(200).json({ 
      message: 'User updated successfully',
      state: 'success'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', state: 'error' });
  }
});


module.exports = router;