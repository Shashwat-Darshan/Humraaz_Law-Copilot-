const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Create new complaint
router.post('/', isAuthenticated, complaintController.createComplaint);

// Get all complaints
router.get('/', complaintController.getAllComplaints);

// Get complaint by ID
router.get('/:id', complaintController.getComplaintById);

// Get user's complaints
router.get('/user/me', isAuthenticated, complaintController.getUserComplaints);

// Update complaint status
router.put('/:id/status', isAuthenticated, complaintController.updateComplaintStatus);

// Delete complaint
router.delete('/:id', isAuthenticated, complaintController.deleteComplaint);

module.exports = router;