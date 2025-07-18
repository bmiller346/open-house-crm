import { AppDataSource } from '../../data-source';
import { Property } from '../../entities/Property';
import type { Property as PropertyType } from './types';

export async function listInventory(userId: string, workspaceId: string): Promise<Property[]> {
  const propertyRepository = AppDataSource.getRepository(Property);
  return propertyRepository.find({
    where: { workspaceId },
    order: { createdAt: 'DESC' }
  });
}

export async function getProperty(propertyId: string, userId: string, workspaceId: string): Promise<Property | null> {
  const propertyRepository = AppDataSource.getRepository(Property);
  return propertyRepository.findOne({
    where: { id: propertyId, workspaceId }
  });
}

export async function createProperty(data: {
  address: string;
  price?: number;
  propertyType?: string;
  workspaceId: string;
  createdBy?: string;
}): Promise<Property> {
  const propertyRepository = AppDataSource.getRepository(Property);
  const property = propertyRepository.create({
    address: data.address,
    price: data.price,
    propertyType: data.propertyType,
    workspaceId: data.workspaceId,
    createdBy: data.createdBy,
    status: 'available'
  });
  return propertyRepository.save(property);
}

export async function updateProperty(propertyId: string, userId: string, workspaceId: string, updates: Partial<PropertyType>): Promise<Property | null> {
  const propertyRepository = AppDataSource.getRepository(Property);
  await propertyRepository.update(
    { id: propertyId, workspaceId },
    { ...updates, updatedBy: userId }
  );
  return propertyRepository.findOne({
    where: { id: propertyId, workspaceId }
  });
}

export async function deleteProperty(propertyId: string, userId: string, workspaceId: string): Promise<void> {
  const propertyRepository = AppDataSource.getRepository(Property);
  await propertyRepository.delete({ id: propertyId, workspaceId });
}
