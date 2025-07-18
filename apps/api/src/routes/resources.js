const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const resourceService = require('../services/ResourceCenterService');

// Resource endpoints
router.get('/', auth, async (req, res) => {
  const { category, search, difficulty } = req.query;
  const workspaceId = req.header('x-workspace-id');
  
  try {
    let resources;
    if (search) {
      resources = await resourceService.searchResources(search, workspaceId, { category, difficulty });
    } else if (category && category !== 'all') {
      resources = await resourceService.getResourcesByCategory(category, workspaceId, difficulty);
    } else {
      resources = await resourceService.getAllResources(workspaceId);
    }
    
    res.json({ success: true, data: resources });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

router.post('/:id/view', auth, async (req, res) => {
  try {
    await resourceService.incrementViews(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    await resourceService.incrementLikes(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// User notes endpoints
router.get('/notes', auth, async (req, res) => {
  const userId = req.user.id;
  const workspaceId = req.header('x-workspace-id');
  const { resourceId, dealId, tags } = req.query;
  
  try {
    const notes = await resourceService.getUserNotes(userId, workspaceId, { resourceId, dealId, tags });
    res.json({ success: true, data: notes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

router.post('/notes', auth, async (req, res) => {
  const userId = req.user.id;
  const workspaceId = req.header('x-workspace-id');
  
  try {
    const note = await resourceService.createUserNote(userId, workspaceId, req.body);
    res.json({ success: true, data: note });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// Calculator endpoints
router.post('/calculators/:id/calculate', auth, async (req, res) => {
  try {
    const result = await resourceService.runCalculation(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
