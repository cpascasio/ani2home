const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const userSchema = require('../models/userModels'); // Import the userSchema

//const userSchema = require('../models/userModels');

// Initialize Firebase Admin SDK
// Note: Ensure you've initialized Firebase Admin SDK elsewhere in your project,
// usually in your main server file, with the necessary configuration.

// Firestore database reference
const db = admin.firestore();

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

    // Add user data to Firestore, excluding the userId from the document fields
    await db.collection('users').doc(userId).set(userData);

    console.log('User data successfully written to Firestore');
  } catch (error) {
    console.error('Error adding user data to Firestore:', error);
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
  // Validate the request body against the schema

  console.log('Request body:', req.body);

  // get rememberMe from the request body
  const rememberMe = req.body.rememberMe;


  // check firebase db users collection for userid if existing
  const userId = req.body.userId; // Assuming userId is part of the request body
  try {
    const userExists = await checkUserExists(userId);

    if (userExists) {
      return res.status(400).json({
        message: 'User already exists',
        state: 'error',
      });
    }
  } catch (error) {
    console.error('Error checking user existence:', error);
    return res.status(500).json({
      message: 'Error checking user existence',
      state: 'error',
    });
  }


  const { error, value } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  
  console.log(value);

  try {
    // Assuming 'add' is a method to add a new document. This might need to be adjusted based on your DB API.
    await addUserToFirestore(value);
    res.status(201).json({ 
      message: 'User created successfully',
      state: 'success'

     });
  } catch (error) {
    console.error('Error creating user:', error);
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
      return res.status(404).send('User not found');
    }
    res.status(200).json(doc.data());
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send('Error fetching user');
  }
});


module.exports = router;