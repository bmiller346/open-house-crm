// 🔑 Auth controller (to be implemented)
import { Request, Response } from 'express';
import { authenticateUser } from './service';

export async function loginHandler(req: Request, res: Response) {
  const { email, password } = req.body;
  const result = await authenticateUser({ email, password });
  res.json(result);
}
