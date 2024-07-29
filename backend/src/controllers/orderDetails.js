const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

const orderDetailSchema = require('../models/orderDetailsModels');

//const productRoutes = require('express').Router();

// Firestore database reference
const db = admin.firestore();


module.exports = router;