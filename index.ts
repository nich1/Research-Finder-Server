import express, { Request, Response } from 'express';
import admin from 'firebase-admin'; // Import Firebase Admin SDK

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Initialize Firebase Admin SDK using environment variables
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY as string), // Handle new line character
  }),
  databaseURL: 'https://research-finder-1000.firebaseio.com',
});

// Firestore database instance
const db = admin.firestore();

enum WorkType {
  Remote = 'remote',
  Online = 'online',
  Hybrid = 'hybrid',
}


// GET request
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Express on Vercel!');
});

// POST route to echo back the request body and store it in Firestore
app.post('/echo', async (req: Request, res: Response) => {
  try {
    // Echo the data back to the user
    const data = req.body;
    res.json({
      message: 'You sent the following data:',
      data: data,
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

// GET request to fetch all posts
app.get('/posts', async (req: Request, res: Response) => {
  try {
    const postsCollection = db.collection('posts');
    const snapshot = await postsCollection.get();
    
    // Map over the documents and extract data
    const posts = snapshot.docs.map(doc => ({
      id: doc.id, // Include the document ID
      ...doc.data() // Spread the document data
    }));

    res.json(posts); // Return the posts as an array in JSON format
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// POST route for adding research data
app.post('/posts', async (req: Request, res: Response) => {
  const {
    researcherID,
    researcherName,
    title,
    body,
    organization,
    compensation,
    workType,
    approvalMessage,
    expirationDate,
    approvedUsers
  } = req.body;

  // Validate the required fields
  if (!workType || !researcherID || !researcherName || !title || !body || !organization || !compensation || !approvalMessage || !Array.isArray(approvedUsers)) {
    return res.status(400).json({ message: 'Missing required fields or approvedUsers is not an array.' });
  }

  try {
    // Prepare the data object
    const researchData = {
      researcherID,
      researcherName,
      title,
      body,
      organization,
      compensation,
      approvalMessage,
      workType,
      approvedUsers,
      expirationDate: admin.firestore.Timestamp.fromDate(new Date(expirationDate)), // Convert to Firestore Timestamp

      createdAt: admin.firestore.FieldValue.serverTimestamp(), // Optional: add a timestamp
    };

    // Store the data in Firestore
    const docRef = db.collection('posts').doc(); // Creates a new document
    await docRef.set(researchData); // Store the request body in the new document
    console.log('Research data saved to Firestore');

    // Respond back to the user
    res.status(201).json({
      message: 'Research data added successfully',
      data: researchData,
      id: docRef.id // Return the unique document ID
    });
  } catch (error) {
    console.error('Error saving research data to Firestore:', error);
    res.status(500).send('Error saving research data');
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
