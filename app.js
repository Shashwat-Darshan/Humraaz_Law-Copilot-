const express = require('express');
const path = require('path');
const app = express();
const MongoClient = require('mongodb').MongoClient;
app.use(express.urlencoded({ extended: true }));
// Serve static files from the 'frontend' folder
const uri = "mongodb+srv://shashwatdarshan153:1111@cluster0.xagjscq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

// Call the function to connect to MongoDB
connectToMongoDB();
// Set the view engine to EJS
app.set('view engine', 'ejs');

// Serve static files from the 'frontend' folder
app.use(express.static(path.join(__dirname, 'frontend')));
 let userData;
// Define route to render index.ejs from frontend/
app.get('/', (req, res) => { 
    res.render(path.join(__dirname, 'frontend',  'index'));
});


app.get('/register', (req, res) => { 
    res.render(path.join(__dirname,  'frontend', 'register'));
});

// Assuming you have already connected to MongoDB and have access to the 'users' collection

// Import any necessary modules here

// Define the 'store' function

app.post('/register_submit1', async (req, res) => {
    try {
        const userData = {
            role:"req",
            firstName: req.body.organisation_id,
            firstName: req.body.first_name,
            lastName: req.body.last_name,
            religion: req.body.Religion,
            city: req.body.city,
            phone: req.body.Phone,
            password: req.body.password
        };

        const usersCollection = client.db().collection('representative');
        const All_user = client.db().collection('All_user');
        const user = await All_user.insertOne(userData);
        const result = await usersCollection.insertOne(userData);
        console.log(`User data stored successfully with ID: ${result.insertedId}`);
        
        res.send('Form submitted and saved to database successfully!');
    } catch (error) {
        console.error("Error storing user data:", error);
        res.status(500).send('Error saving to database');
    }
});


app.post('/register_submit2', async (req, res) => {
    try {
        const userData = {
            role:"user",
            firstName: req.body.first_name,
            lastName: req.body.last_name,
            religion: req.body.Religion,
            city: req.body.city,
            phone: req.body.Phone,
            password: req.body.password
        };

        const usersCollection = client.db().collection('users');
        const result = await usersCollection.insertOne(userData);
        const All_user = client.db().collection('All_user');
        const user = await All_user.insertOne(userData);
        console.log(`User data stored successfully with ID: ${result.insertedId}`);
        show(result.insertedId);
        res.send('Form submitted and saved to database successfully!');
    } catch (error) {
        console.error("Error storing user data:", error);
        res.status(500).send('Error saving to database');
    }
});

app.get('/login_check',(req,res)=>{
    
});


// Your routes and other middleware configurations...

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});