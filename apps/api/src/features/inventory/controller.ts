// Inventory controller (to be implemented)
import { Request, Response } from 'express';
import { listInventory, getProperty, createProperty, updateProperty, deleteProperty } from './service';

export async function getInventoryHandler(req: Request, res: Response) {
  try {
    // @ts-ignore AuthRequest
    const { userId } = req.user;
    const workspaceId = req.headers['x-workspace-id'] as string;
    const data = await listInventory(userId, workspaceId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
}

export async function getPropertyHandler(req: Request, res: Response) {
  try {
    // @ts-ignore AuthRequest
    const { userId } = req.user;
    const workspaceId = req.headers['x-workspace-id'] as string;
    const { propertyId } = req.params;
    const property = await getProperty(propertyId, userId, workspaceId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch property' });
  }
}

export async function createPropertyHandler(req: Request, res: Response) {
  try {
    const workspaceId = req.headers['x-workspace-id'] as string;
    const { address, value } = req.body;
    const property = await createProperty({
      address,
      value,
      workspaceId
    });
    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create property' });
  }
}

export async function updatePropertyHandler(req: Request, res: Response) {
  try {
    // @ts-ignore AuthRequest
    const { userId } = req.user;
    const workspaceId = req.headers['x-workspace-id'] as string;
    const { propertyId } = req.params;
    const property = await updateProperty(propertyId, userId, workspaceId, req.body);
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update property' });
  }
}

export async function deletePropertyHandler(req: Request, res: Response) {
  try {
    // @ts-ignore AuthRequest
    const { userId } = req.user;
    const workspaceId = req.headers['x-workspace-id'] as string;
    const { propertyId } = req.params;
    await deleteProperty(propertyId, userId, workspaceId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete property' });
  }
}
