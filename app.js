const express = require('express');
const path = require('path');
const { stringify } = require('querystring');
const app = express();
const MongoClient = require('mongodb').MongoClient;
app.use(express.urlencoded({ extended: true }));
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const { formatMessage } = require('./utils/message');
const {
  joinUser,
  getCurrentUser,
  disconnectUser,
  roomUsers,
} = require('./utils/user');
// Serve static files from the 'frontend' folder
const uri = "mongodb+srv://shashwatdarshan153:12345@cluster0.8xhd5rb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const All_user = client.db().collection('All_user');
const reprentative = client.db().collection('representative');
const usersCollection = client.db().collection('users');
const complaint = client.db().collection('complaints');
const poll = client.db().collection('poll');
// Connect to MongoDB
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
app.set('views', path.join(__dirname, 'frontend'));

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'frontend')));


let userData;
// Define route to render index.ejs from frontend/
app.get('/', (req, res) => {
    const dbName = client.db().databaseName;
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
    
});


app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'register.html'));
});


app.post('/register_submit1', async (req, res) => {
    console.log("entering user data","\n")
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
        console .log(userData ,"\n***************************************")
        
        
        const user = await All_user.insertOne(userData);
        const result = await reprentative.insertOne(userData);
        console.log(`User data stored successfully with ID: ${result.insertedId}`);
        
        res.sendFile(path.join(__dirname, 'frontend', 'successfully-registered.html'));
    } catch (error) {
        console.error("Error storing user data:", error);
        res.status(500).send('Error saving to database');
    }
});


app.post('/register_submit2', async (req, res) => {
    console.log("entering user data")
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

        console .log(userData ,"\n***************************************\n")
        const result = await usersCollection.insertOne(userData);

        const user = await All_user.insertOne(userData);
        console.log(`User data stored successfully with ID: ${result.insertedId}`);
        
        res.sendFile(path.join(__dirname, 'frontend', 'successfully-registered.html'));
    } catch (error) {
        console.error("Error storing user data:", error);
        res.status(500).send('Error saving to database');
    }
});

app.get('/login', async (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});
let user_password,user_number;
app.get('/login_submit', async (req, res) => {
    try {
        // Retrieve all documents from the "All_user" collection
        const allUsers = await All_user.find({}).toArray();
        // Check if any users were found
        if (allUsers.length > 0) {
            // Iterate over the array of user documents to find the user with the given phone number and password
            const user = allUsers.find(userData => userData.phone == req.query.phone && userData.password == req.query.password);
            user_number=req.query.phone;
            user_password=req.query.password;
            // Check if the user is found
            if (user) {
                // User found, do something with the user data
                console.log(user);
                if(user.role!='req')
                res.sendFile(path.join(__dirname, 'frontend',  'option-user.html'));
                else{
                res.sendFile(path.join(__dirname, 'frontend', "option-representatives.html"));
            }
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
    console .log("\n**********************************************************\n")
});
app.get('/community_chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'path_to_your_community_chat_html_file'));
});




app.get('/jump_option',(req,res)=>{
    console.log(user_number,user_password,"\n******************************************************\n")
    res.sendFile(path.join(__dirname, 'frontend', 'option-user.html'));
})




app.post('/create-poll', async (req, res) => {
    
    const pollName = req.body.pollName;
    const pollOptions = req.body.optionInput;
    console.log(pollName,pollOptions)
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
    console .log("\n**********************************************************\n")
});

app.get('/show_polls', async (req, res) => {
    try {
        const complaints  =[
            {
              _id: "65e90b9cbc43322f85996cd8",
              aim: "Best Solution for Water Scarcity",
              option1: "Rainwater Harvesting",
              option2: "Building Desalination Plants",
              option3: "Water Conservation Campaigns"
            },
            {
              _id: "65e90b9cbc43322f85996cd9",
              aim: "Tackling Air Pollution",
              option1: "Promoting Electric Vehicles",
              option2: "Implementing Stricter Emission Standards",
              option3: "Planting More Trees"
            },
            {
              _id: "65e90b9cbc43322f85996cda",
              aim: "Addressing Food Insecurity",
              option1: "Supporting Sustainable Agriculture",
              option2: "Expanding Food Aid Programs",
              option3: "Investing in Urban Farming Initiatives"
            }
            // Add more poll objects as needed
          ];
          res.sendFile(path.join(__dirname, 'frontend\show_polls.html'));
    } catch (error) {
        console.error('Error retrieving polls:', error);
        res.status(500).send('Error retrieving polls.');
    }
    console .log("\n**********************************************************\n")
});



  app.post('/submit_complaint_form', async (req, res) => {
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
        complaintData["number"]=user_number
        console.log(complaintData);
        // Insert the complaint data into the 'complaints' collection
        const result = await complaint.insertOne(complaintData);
        res.sendFile(path.join(__dirname, 'frontend','successfully-submitted.html'));
        
    } catch (error) {
        console.error('Error processing form submission:', error);
        res.status(500).send('Error processing form submission');
    }
    console .log("\n**********************************************************\n")
});

app.get('/complaint_history', async (req, res) => {
    try {
        // Retrieve complaints data from the database
        const complaints = await complaint.find({}).toArray();
        
        // Filter complaints based on user number
        const userComplaints = complaints.filter(complaint => complaint.number == user_number);
        console.log(complaints);

        // Render the EJS template with the filtered complaints data
        res.render(path.join(__dirname, 'frontend', 'complaint-status'), { complaints: userComplaints });
    } catch (error) {
        console.error('Error retrieving complaints:', error);
        res.status(500).send('Error retrieving complaints');
    }
    console.log("\n**********************************************************\n");
});



//chatting rooms

const botName = 'Hamraaj';


app.get('/chat-rooms', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'room.html'));
});
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = joinUser(socket.id, username, room);

    socket.join(user.room);

    socket.broadcast
      .to(user?.room)
      .emit('message', formatMessage(botName, `${user.username} joined`));
    socket.emit('message', formatMessage(botName, 'Welcome to the ChatCord'));

    // Sent the user list in the frontend
    io.to(user?.room).emit('userList', {
      room: user?.room,
      users: roomUsers(user?.room),
    });
  });

  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user?.room).emit('message', formatMessage(user.username, msg));
  });

  socket.on('disconnect', () => {
    const user = getCurrentUser(socket.id);
    disconnectUser(socket.id);
    // Sent the user list in the frontend
    io.to(user?.room).emit('userList', {
      room: user?.room,
      users: roomUsers(user?.room),
    });
    io.to(user?.room).emit(
      'message',
      formatMessage(botName, `${user?.username} has leave from the ChatCord`)
    );
  });
});


app.get('/create_poll', (req, res) => {
    res.sendFile(__dirname + '/create_polls.html');
});
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});