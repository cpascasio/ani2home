const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Initialize Firebase Admin SDK
// Note: Ensure you've initialized Firebase Admin SDK elsewhere in your project,
// usually in your main server file, with the necessary configuration.

// Firestore database reference
const db = admin.firestore();

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