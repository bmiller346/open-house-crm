// Transactions service (to be implemented)
import type { Transaction as TransactionType } from './types';
import { AppDataSource } from '../../data-source';
import { Transaction as TransactionEntity } from '../../entities/Transaction';

export async function listTransactions(userId: string, workspaceId: string): Promise<TransactionEntity[]> {
  const transactionRepository = AppDataSource.getRepository(TransactionEntity);
  return transactionRepository.find({ where: { workspaceId } });
}

export async function getTransaction(transactionId: string, userId: string, workspaceId: string): Promise<TransactionEntity | null> {
  const transactionRepository = AppDataSource.getRepository(TransactionEntity);
  return transactionRepository.findOne({ where: { id: transactionId, workspaceId } });
}

export async function createTransaction(data: {
  contactId: string;
  pipelineStage: string;
  amount: number;
  workspaceId: string;
}): Promise<TransactionEntity> {
  const transactionRepository = AppDataSource.getRepository(TransactionEntity);
  const transaction = transactionRepository.create(data);
  return await transactionRepository.save(transaction);
}

export async function updateTransaction(transactionId: string, userId: string, workspaceId: string, updates: Partial<TransactionType>): Promise<TransactionEntity> {
  const transactionRepository = AppDataSource.getRepository(TransactionEntity);
  const transaction = await transactionRepository.findOne({ where: { id: transactionId, workspaceId } });
  if (!transaction) {
    throw new Error('Transaction not found or access denied');
  }
  Object.assign(transaction, updates);
  return await transactionRepository.save(transaction);
}

export async function deleteTransaction(transactionId: string, userId: string, workspaceId: string): Promise<void> {
  const transactionRepository = AppDataSource.getRepository(TransactionEntity);
  const transaction = await transactionRepository.findOne({ where: { id: transactionId, workspaceId } });
  if (!transaction) {
    throw new Error('Transaction not found or access denied');
  }
  await transactionRepository.remove(transaction);
}
