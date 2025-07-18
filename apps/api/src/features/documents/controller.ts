// Documents controller (to be implemented)
import { Request, Response } from 'express';
import { listDocuments } from './service';

export async function getDocumentsHandler(req: Request, res: Response) {
  const data = await listDocuments();
  res.json(data);
}
