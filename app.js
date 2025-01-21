require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const { formatMessage } = require('./utils/message');
const { connectToMongoDB } = require('./config/database');
const { joinUser, getCurrentUser, disconnectUser, roomUsers } = require('./utils/user');
const session = require('express-session');
const sessionConfig = require('./config/session');
const { addUserToLocals, isAuthenticated } = require('./middleware/auth');

// Debug function
const debug = (message, data = null) => {
    console.log('\x1b[33m%s\x1b[0m', '[APP]', message);
    if (data) console.log(JSON.stringify(data, null, 2));
};

debug('Starting Humraaj application...');

// Import routes
const complaintsRouter = require('./routes/complaints');
const authRouter = require('./routes/auth');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files - make sure paths are absolute
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.static(path.join(__dirname, 'public')));

debug('Initializing session middleware');
// Session middleware
app.use(session(sessionConfig));
app.use(addUserToLocals);

debug('Setting up routes');
// Routes
app.use('/auth', authRouter);
app.use('/complaints', isAuthenticated, complaintsRouter);

// Public routes
app.get('/', (req, res) => {
    debug('Accessing home page');
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/login', (req, res) => {
    debug('Accessing login page, session:', req.session);
    if (req.session.user) {
        debug('User already logged in, redirecting:', req.session.user);
        return res.redirect(req.session.user.role === 'req' ? '/option-representatives' : '/option-user');
    }
    res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

app.get('/register', (req, res) => {
    debug('Accessing registration page');
    res.sendFile(path.join(__dirname, 'frontend', 'register.html'));
});

// Protected routes
app.get('/option-user', isAuthenticated, (req, res) => {
    debug('Accessing user options page, user:', req.session.user);
    if (req.session.user.role === 'req') {
        debug('Representative accessing user page, redirecting');
        return res.redirect('/option-representatives');
    }
    res.sendFile(path.join(__dirname, 'frontend', 'option-user.html'));
});

app.get('/option-representatives', isAuthenticated, (req, res) => {
    debug('Accessing representative options page, user:', req.session.user);
    if (req.session.user.role !== 'req') {
        debug('Non-representative accessing rep page, redirecting');
        return res.redirect('/option-user');
    }
    res.sendFile(path.join(__dirname, 'frontend', 'option-representatives.html'));
});

// Define route to render community_chat.html from frontend/
app.get('/community_chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'community_chat.html'));
});

// Define route to render jump_option.html from frontend/
app.get('/jump_option', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'jump_option.html'));
});

// Define route to render complaint_history.html from frontend/
app.get('/complaint_history', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'complaint_history.html'));
});

// Define route to render complaint_history_all.html from frontend/
app.get('/complaint_history_all', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'complaint_history_all.html'));
});

// Define route to render complaint_history_solved.html from frontend/
app.get('/complaint_history_solved', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'complaint_history_solved.html'));
});

// Define route to render show_polls.html from frontend/
app.get('/show_polls', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'show_polls.html'));
});

// Define route to render create_polls.html from frontend/
app.get('/create_poll', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'create_polls.html'));
});

// Define route to render chat-rooms.html from public/
app.get('/chat-rooms', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'room.html'));
});

// Socket.io connection
io.on('connection', (socket) => {
    debug('New socket connection:', socket.id);
    
    socket.on('joinRoom', ({ username, room }) => {
        debug('User joining room:', { username, room, socketId: socket.id });
        const user = joinUser(socket.id, username, room);

        socket.join(user.room);
        debug('Room joined successfully:', user);

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
        debug('Chat message received:', { socketId: socket.id, message: msg });
        const user = getCurrentUser(socket.id);
        io.to(user?.room).emit('message', formatMessage(user.username, msg));
    });

    socket.on('disconnect', () => {
        debug('User disconnected:', socket.id);
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

// Connect to MongoDB
debug('Connecting to MongoDB...');
connectToMongoDB()
    .then(() => {
        debug('Successfully connected to MongoDB');
        // Start the server only after MongoDB connection is established
        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            debug(`Server is running on port ${PORT}`);
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        debug('Failed to connect to MongoDB:', err);
        process.exit(1);
    });