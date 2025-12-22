import express from 'express';
import Resource from '../models/Resource.js';
import Tutor from '../models/Tutor.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all resources (Public/Student)
router.get('/', async (req, res) => {
  try {
    const { subject } = req.query;
    const query = subject && subject !== 'All' ? { subject } : {};

    const resources = await Resource.find(query)
      .populate('uploaded_by', 'name profile_pic')
      .sort({ createdAt: -1 });

    res.json({ resources });
  } catch (error) {
    console.error('Get Resources Error:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Create a new resource (Tutor only)
router.post('/', authenticateToken, authorizeRoles('tutor'), async (req, res) => {
  try {
    const { title, type, url, description, subject } = req.body;

    // Find the tutor profile associated with the user
    const tutor = await Tutor.findOne({ user_id: req.user.id });
    if (!tutor) {
      return res.status(404).json({ error: 'Tutor profile not found' });
    }

    const resource = new Resource({
      title,
      type,
      url,
      description,
      subject,
      uploaded_by: tutor._id
    });

    await resource.save();
    res.status(201).json({ message: 'Resource shared successfully', resource });
  } catch (error) {
    console.error('Create Resource Error:', error);
    res.status(500).json({ error: 'Failed to share resource' });
  }
});

// Delete a resource (Tutor only - owner only)
router.delete('/:id', authenticateToken, authorizeRoles('tutor'), async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user_id: req.user.id });
    if (!tutor) return res.status(404).json({ error: 'Tutor profile not found' });

    const resource = await Resource.findOneAndDelete({
      _id: req.params.id,
      uploaded_by: tutor._id
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found or unauthorized' });
    }

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete Resource Error:', error);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

export default router;
