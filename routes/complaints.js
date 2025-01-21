const express = require('express');
const router = express.Router();
const { getCollections } = require('../config/database');

// Get all complaints
router.get('/history/all', async (req, res) => {
    try {
        const { complaints } = getCollections();
        const userComplaints = await complaints.find({}).toArray();
        res.json(userComplaints);
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Submit new complaint
router.post('/submit', async (req, res) => {
    try {
        const { complaints } = getCollections();
        const complaintData = req.body;
        await complaints.insertOne(complaintData);
        res.redirect('/successfully-submitted');
    } catch (error) {
        console.error('Error submitting complaint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
