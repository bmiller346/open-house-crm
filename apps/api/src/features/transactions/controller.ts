// Transactions controller (to be implemented)
import { Request, Response } from 'express';
import { listTransactions, getTransaction, createTransaction, updateTransaction, deleteTransaction } from './service';

export async function getTransactionsHandler(req: Request, res: Response) {
  try {
    // @ts-ignore AuthRequest
    const { userId } = req.user;
    const workspaceId = req.headers['x-workspace-id'] as string;
    const result = await listTransactions(userId, workspaceId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}

export async function getTransactionHandler(req: Request, res: Response) {
  try {
    // @ts-ignore AuthRequest
    const { userId } = req.user;
    const workspaceId = req.headers['x-workspace-id'] as string;
    const { transactionId } = req.params;
    const transaction = await getTransaction(transactionId, userId, workspaceId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
}

export async function createTransactionHandler(req: Request, res: Response) {
  try {
    const workspaceId = req.headers['x-workspace-id'] as string;
    const { contactId, pipelineStage, amount } = req.body;
    const transaction = await createTransaction({
      contactId,
      pipelineStage,
      amount,
      workspaceId
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
}

export async function updateTransactionHandler(req: Request, res: Response) {
  try {
    // @ts-ignore AuthRequest
    const { userId } = req.user;
    const workspaceId = req.headers['x-workspace-id'] as string;
    const { transactionId } = req.params;
    const transaction = await updateTransaction(transactionId, userId, workspaceId, req.body);
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update transaction' });
  }
}

export async function deleteTransactionHandler(req: Request, res: Response) {
  try {
    // @ts-ignore AuthRequest
    const { userId } = req.user;
    const workspaceId = req.headers['x-workspace-id'] as string;
    const { transactionId } = req.params;
    await deleteTransaction(transactionId, userId, workspaceId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
}
