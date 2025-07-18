import { Request, Response } from 'express';
import { listWorkspaces, getWorkspace, createWorkspace, updateWorkspace } from './service';

export async function getWorkspacesHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const workspaces = await listWorkspaces(userId);
    
    res.json({
      success: true,
      data: workspaces
    });
  } catch (error: any) {
    console.error('Get workspaces error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workspaces'
    });
  }
}

export async function getWorkspaceHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const { workspaceId } = req.params;
    
    const workspace = await getWorkspace(workspaceId, userId);
    
    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Workspace not found'
      });
    }
    
    res.json({
      success: true,
      data: workspace
    });
  } catch (error: any) {
    console.error('Get workspace error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workspace'
    });
  }
}

export async function createWorkspaceHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const { name, slug, settings } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Workspace name is required'
      });
    }
    
    const workspace = await createWorkspace({
      name,
      slug,
      ownerId: userId,
      settings
    });
    
    res.status(201).json({
      success: true,
      data: workspace
    });
  } catch (error: any) {
    console.error('Create workspace error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create workspace'
    });
  }
}

export async function updateWorkspaceHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const { workspaceId } = req.params;
    const updates = req.body;
    
    const workspace = await updateWorkspace(workspaceId, userId, updates);
    
    res.json({
      success: true,
      data: workspace
    });
  } catch (error: any) {
    console.error('Update workspace error:', error);
    
    if (error.message === 'Workspace not found or access denied') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update workspace'
    });
  }
}
