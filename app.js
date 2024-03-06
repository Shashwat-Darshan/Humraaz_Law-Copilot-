const express = require('express');
const path = require('path');
const app = express();
const MongoClient = require('mongodb').MongoClient;
app.use(express.urlencoded({ extended: true }));
// Serve static files from the 'frontend' folder
const uri = "mongodb+srv://shashwatdarshan153:1111@cluster0.xagjscq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const All_user = client.db().collection('All_user');
const reprentative = client.db().collection('representative');
const usersCollection = client.db().collection('users');
const complaint = client.db().collection('complaints');
const poll = client.db().collection('poll');
// Connect to MongoDB
app.use(express.static(path.join(__dirname, 'frontend')));
async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

let user;
// Call the function to connect to MongoDB
connectToMongoDB();
// Set the view engine to EJS
app.set('view engine', 'ejs');

// Serve static files from the 'frontend' folder
app.use(express.static(path.join(__dirname, 'frontend')));
let userData;
// Define route to render index.ejs from frontend/
app.get('/', (req, res) => {
    const dbName = client.db().databaseName;
    res.render(path.join(__dirname, 'frontend', 'index'));
});


app.get('/register', (req, res) => {
    res.render(path.join(__dirname, 'frontend', 'register'));
});


app.post('/register_submit1', async (req, res) => {
    try {
        const userData = {
            role: "req",
            firstName: req.body.organisation_id,
            firstName: req.body.first_name,
            lastName: req.body.last_name,
            religion: req.body.Religion,
            city: req.body.city,
            phone: req.body.Phone,
            password: req.body.password
        };



        const user = await All_user.insertOne(userData);
        const result = await reprentative.insertOne(userData);
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
            role: "user",
            firstName: req.body.first_name,
            lastName: req.body.last_name,
            religion: req.body.Religion,
            city: req.body.city,
            phone: req.body.Phone,
            password: req.body.password
        };


        const result = await usersCollection.insertOne(userData);

        const user = await All_user.insertOne(userData);
        console.log(`User data stored successfully with ID: ${result.insertedId}`);
        show(result.insertedId);
        res.send('Form submitted and saved to database successfully!');
    } catch (error) {
        console.error("Error storing user data:", error);
        res.status(500).send('Error saving to database');
    }
});

app.get('/login', async (req, res) => {
    res.render(path.join(__dirname, 'frontend', 'login'));
});

app.get('/login_submit', async (req, res) => {
    try {
        // Retrieve all documents from the "All_user" collection
        const allUsers = await All_user.find({}).toArray();
        console.log(allUsers);

        // Check if any users were found
        if (allUsers.length > 0) {
            // Iterate over the array of user documents to find the user with the given phone number and password
            const user = allUsers.find(userData => userData.phone == req.query.phone && userData.password == req.query.password);

            // Check if the user is found
            if (user) {
                // User found, do something with the user data
                console.log(user);
                MainUser=user._id;
                res.render(path.join(__dirname, 'frontend', 'option-user'));// Send the user data as a JSON response
            } else {
                // User not found
                console.log('User not found');
                res.status(404).send('User not found');
            }
        } else {
            // No users found
            console.log('No users found');
            res.status(404).send('No users found');
        }
    } catch (error) {
        console.error('Error retrieving all users:', error);
        res.status(500).send('Error retrieving all users');
    }
});
app.get('/community_chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'path_to_your_community_chat_html_file'));
});


app.post('/submit_contact_form', async (req, res) => {
    try {
        // Extract data from the request body
        const { fullname, email, subject, message } = req.body;

        // Create an object with the form data
        const complaintData = {
            fullname,
            email,
            subject,
            message,
            resolved: false // Add the resolved key with value false
        };
        console.log(complaintData);
        // Insert the complaint data into the 'complaints' collection
        const result = await complaint.insertOne(complaintData);
        res.render(path.join(__dirname, 'frontend', 'successfully-submitted'));
        // Check if insertion was successful
        if (result.insertedCount == 1) {
            console.log('Complaint submitted successfully:', result.insertedId);
            res.render(path.join(__dirname, 'frontend', 'successfully-submitted'));
        } else {
            console.error('Error submitting complaint');
            res.status(500).send('Error submitting complaint');
        }
    } catch (error) {
        console.error('Error processing form submission:', error);
        res.status(500).send('Error processing form submission');
    }
});

app.get('/jump_option',(req,res)=>{
    res.render(path.join(__dirname, 'frontend', 'option-user'));
})


app.get('/complaint_history', async (req, res) => {
    try {
        // Retrieve complaints data from the database
        const complaints = await complaint.find().toArray();
        console.log(complaints);
        // Render the EJS template with the complaints data
        res.render(path.join(__dirname, 'frontend', 'complaint-status'), { complaints: complaints });
    } catch (error) {
        console.error('Error retrieving complaints:', error);
        res.status(500).send('Error retrieving complaints');
    }
});

app.get('/create_poll', (req, res) => {
    res.sendFile(__dirname + '/create_polls.html');
});

app.post('/create_poll', async (req, res) => {
    const pollName = req.body.pollName;
    const pollOptions = req.body.optionInput;
    
    if (!pollName || !pollOptions || pollOptions.length < 2) {
        res.status(400).send('Please enter a valid poll name and at least two options.');
        return;
    }
    
    try {
        const newPoll = new Poll({
            name: pollName,
            options: pollOptions
        });
        const result = await complaint.insertOne(newPoll);
        res.status(201).send('Poll created successfully!');
        res.redirect("/jump_option");
    } catch (error) {
        console.error('Error saving poll:', error);
        res.status(500).send('Error creating poll.');
    }
});

app.get('/show_polls', async (req, res) => {
    try {
        const complaints  = await poll.find().toArray();
        res.render(path.join(__dirname, 'frontend', 'complaint-status'), { complaints  });
    } catch (error) {
        console.error('Error retrieving polls:', error);
        res.status(500).send('Error retrieving polls.');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});