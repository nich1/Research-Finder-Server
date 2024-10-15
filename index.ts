import express, { Request, Response } from 'express';
import admin from 'firebase-admin'; // Import Firebase Admin SDK
import { ServiceAccount } from 'firebase-admin';

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Initialize Firebase Admin SDK using environment variables
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY, // Handle new line character
  }),
  databaseURL: 'https://research-finder-1000.firebaseio.com'
});

// Firestore database instance
const db = admin.firestore();

// GET request
app.get('/', (req, res) => {
  res.send('Hello, Express on Vercel!');
});

// POST route to echo back the request body and store it in Firestore
app.post('/echo', async (req, res) => {
  try {
    // Echo the data back to the user
    const data = req.body;
    res.json({
      message: 'You sent the following data:',
      data: data
    });

    // Store the data in Firestore
    const docRef = db.collection('echoData').doc(); // Creates a new document
    await docRef.set(data); // Store the request body in the new document
    console.log('Data saved to Firestore');
  } catch (error) {
    console.error('Error saving data to Firestore:', error);
    res.status(500).send('Error saving data');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
