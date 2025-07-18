// Analytics controller (to be implemented)
import { Request, Response } from 'express';
import { getAnalytics } from './service';

export async function getAnalyticsHandler(req: Request, res: Response) {
  const data = await getAnalytics();
  res.json(data);
}
