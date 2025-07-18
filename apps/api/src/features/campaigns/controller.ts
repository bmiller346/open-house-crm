// Campaigns controller (to be implemented)
import { Request, Response } from 'express';
import { listCampaigns } from './service';

export async function getCampaignsHandler(req: Request, res: Response) {
  const data = await listCampaigns();
  res.json(data);
}
