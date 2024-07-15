const express = require('express');
const cors = require('cors'); // Import CORS module
const middleware = require('./middleware'); // Import middleware
const userRouters = require('./routes/users'); // Import the user routes

const app = express();



app.use(cors()); // Use CORS module

const port = process.env.PORT || 5000;

// Create an API router
const apiRouter = express.Router();

// Apply middleware specific to API routes
apiRouter.use(middleware.decodeToken); // checks if the user is authorized by checking the token

// Mount the user routes to the API router
apiRouter.use('/users', userRouters); // Use the user routes

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