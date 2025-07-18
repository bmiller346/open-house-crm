// Pipelines controller (to be implemented)
import { Request, Response } from 'express';
import { listPipelines } from './service';

export async function getPipelinesHandler(req: Request, res: Response) {
  // @ts-ignore AuthRequest
  const { userId } = req.user;
  const workspaceId = req.headers['x-workspace-id'] as string;
  const data = await listPipelines(userId, workspaceId);
  res.json(data);
}
