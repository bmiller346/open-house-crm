import { Router, Response } from 'express';
import { Request } from 'express';
import { resourceCenterService } from './service';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();

// Resource endpoints
router.get('/', authMiddleware, async (req: any, res: Response) => {
  const { category, search, difficulty } = req.query;
  const workspaceId = req.headers['x-workspace-id'] as string;
  const user = req.user;
  const userId = user?.id;
  
  try {
    let resources;
    if (search) {
      resources = await resourceCenterService.searchResources(search as string, workspaceId, { category, difficulty });
    } else if (category && category !== 'all') {
      resources = await resourceCenterService.getResourcesByCategory(category as string, workspaceId, difficulty as string);
    } else {
      resources = await resourceCenterService.getAllResources(workspaceId);
    }
    
    res.json({ success: true, data: resources });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/view', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await resourceCenterService.incrementViews(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/like', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await resourceCenterService.incrementLikes(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// User notes endpoints
router.get('/notes', authMiddleware, async (req: any, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  const userId = user.id;
  const workspaceIdHeader = req.headers['x-workspace-id'];
  if (typeof workspaceIdHeader !== 'string') {
    return res.status(400).json({ success: false, error: 'Workspace ID header missing or invalid' });
  }
  const workspaceId = workspaceIdHeader;
  const { resourceId, dealId, tags } = req.query;
  
  try {
    const notes = await resourceCenterService.getUserNotes(userId, workspaceId, { resourceId, dealId, tags });
    res.json({ success: true, data: notes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/notes', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  const userId = user.id;
  const workspaceIdHeader = req.headers['x-workspace-id'];
  if (typeof workspaceIdHeader !== 'string') {
    return res.status(400).json({ success: false, error: 'Workspace ID header missing or invalid' });
  }
  const workspaceId = workspaceIdHeader;
  
  try {
    const note = await resourceCenterService.createUserNote(userId, workspaceId, req.body);
    res.status(201).json({ success: true, data: note });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/notes/:id', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  const userId = user.id;
  const workspaceIdHeader = req.headers['x-workspace-id'];
  if (typeof workspaceIdHeader !== 'string') {
    return res.status(400).json({ success: false, error: 'Workspace ID header missing or invalid' });
  }
  const workspaceId = workspaceIdHeader;
  const { id } = req.params;
    
    try {
      await resourceCenterService.updateUserNote(id, userId, req.body);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/notes/:id', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  const userId = user.id;
  const workspaceIdHeader = req.headers['x-workspace-id'];
  if (typeof workspaceIdHeader !== 'string') {
    return res.status(400).json({ success: false, error: 'Workspace ID header missing or invalid' });
  }
  const workspaceId = workspaceIdHeader;
  const { id } = req.params;
    
    try {
      await resourceCenterService.deleteUserNote(id, userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
});


// Calculator endpoints
router.post('/calculators/:id/calculate', authMiddleware, async (req: any, res: Response) => {
  const { id } = req.params;
  const inputs = req.body;
  
  try {
    const result = await resourceCenterService.runCalculation(id, inputs);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
