const Complaint = require('../models/complaint');
const { validationResult } = require('express-validator');

class ComplaintController {
    // Create new complaint
    async createComplaint(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { title, description, category, location } = req.body;
            const userId = req.user.id; // Assuming user is authenticated

            const complaint = new Complaint({
                title,
                description,
                category,
                location,
                userId,
                status: 'pending',
                createdAt: new Date()
            });

            await complaint.save();
            res.status(201).json({ message: 'Complaint created successfully', complaint });
        } catch (error) {
            res.status(500).json({ message: 'Error creating complaint', error: error.message });
        }
    }

    // Get all complaints
    async getAllComplaints(req, res) {
        try {
            const complaints = await Complaint.find()
                .sort({ createdAt: -1 })
                .populate('userId', 'name email');
            res.json(complaints);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching complaints', error: error.message });
        }
    }

    // Get complaint by ID
    async getComplaintById(req, res) {
        try {
            const complaint = await Complaint.findById(req.params.id)
                .populate('userId', 'name email');
            
            if (!complaint) {
                return res.status(404).json({ message: 'Complaint not found' });
            }
            
            res.json(complaint);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching complaint', error: error.message });
        }
    }

    // Update complaint status
    async updateComplaintStatus(req, res) {
        try {
            const { status } = req.body;
            const complaint = await Complaint.findById(req.params.id);

            if (!complaint) {
                return res.status(404).json({ message: 'Complaint not found' });
            }

            complaint.status = status;
            complaint.updatedAt = new Date();

            await complaint.save();
            res.json({ message: 'Complaint status updated successfully', complaint });
        } catch (error) {
            res.status(500).json({ message: 'Error updating complaint status', error: error.message });
        }
    }

    // Delete complaint
    async deleteComplaint(req, res) {
        try {
            const complaint = await Complaint.findById(req.params.id);

            if (!complaint) {
                return res.status(404).json({ message: 'Complaint not found' });
            }

            // Check if user is authorized to delete
            if (complaint.userId.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to delete this complaint' });
            }

            await complaint.remove();
            res.json({ message: 'Complaint deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting complaint', error: error.message });
        }
    }

    // Get user's complaints
    async getUserComplaints(req, res) {
        try {
            const complaints = await Complaint.find({ userId: req.user.id })
                .sort({ createdAt: -1 });
            res.json(complaints);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user complaints', error: error.message });
        }
    }
}

module.exports = new ComplaintController();