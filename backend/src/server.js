const express = require('express');
const cors = require('cors'); // Import CORS module
const middleware = require('./middleware'); // Import middleware
const userRouters = require('./controllers/users'); // Import the user routes
const productRoutes = require('./controllers/products'); // Import the product routes
require('dotenv').config();

const app = express();


app.use(cors()); // Use CORS module

const port = process.env.PORT || 3000;

// Create an API router
const apiRouter = express.Router();

// Apply middleware specific to API routes
//apiRouter.use(middleware.decodeToken); // checks if the user is authorized by checking the token

// Mount the user routes to the API router
apiRouter.use('/users', userRouters); // Use the user routes

// Webhook route (add this to your apiRouter or app directly)
apiRouter.post('/lalamove', (req, res) => {
  // Log the request headers and body
  console.log('Webhook received!');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  // Process the webhook data
  const eventType = req.body.event_type;
  // Add your custom logic here based on the event type or payload

  // Respond to the service that sent the webhook
  res.status(200).json({ message: 'Webhook received successfully!' });
});

// product route
apiRouter.use('/products', productRoutes);

// Middleware to parse JSON bodies
app.use(express.json());

// Mount the API router to the app
app.use('/api', apiRouter);

app.get('/', (req, res) => {
    console.log(req.headers);

  return res.json({sample: [
    {
        message: 'Welcome to the Express API boilerplate'
    },
    {
        message: 'This is a sample message'
    },
    {
        message: 'You can add more messages here'
    }
  ]
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});