const express = require('express');
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: true }));
// Serve static files from the 'frontend' folder
app.use(express.static(path.join(__dirname, 'frontend')));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Serve static files from the 'frontend' folder
app.use(express.static(path.join(__dirname, 'frontend')));

// Define route to render index.ejs from frontend/landing-page
app.get('/', (req, res) => { 
    res.render(path.join(__dirname, 'frontend',  'index'));
});
app.post('/login_user_submit', (req, res) => {
    console.log(req.params)
    console.log(req.body);
});
app.get('/trash', (req, res) => {
    res.render(path.join(__dirname, 'frontend',  'trash'));
});
app.get('/choice/:', (req, res) => {
    res.render(path.join(__dirname, 'frontend',  'choice'));
});
// Your routes and other middleware configurations...

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
