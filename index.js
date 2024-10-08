const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Root route to test GET request
app.get('/', (req, res) => {
  res.send('Hello, Express on Vercel!');
});

// POST route to echo back the request body
app.post('/echo', (req, res) => {
    res.send('echo');

});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
