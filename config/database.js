const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
});

let collections = null;

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB successfully");
        
        const db = client.db();
        
        // Initialize collections
        collections = {
            All_user: db.collection('All_user'),
            representative: db.collection('representative'),
            usersCollection: db.collection('users'),  // Fixed collection name to match auth.js
            complaints: db.collection('complaints'),
            polls: db.collection('poll')
        };
        
        return collections;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

function getCollections() {
    if (!collections) {
        throw new Error('Database not initialized. Call connectToMongoDB() first.');
    }
    return collections;
}

module.exports = {
    connectToMongoDB,
    getCollections
};
