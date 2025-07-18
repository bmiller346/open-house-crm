import { webhookEventDispatcher } from '../services/WebhookEventDispatcher';
import { createContactAdvanced, updateContact } from './service';

/**
 * Example: Adding webhook events to existing controllers
 * This file shows how to integrate webhook events into your existing API controllers
 */

// Example 1: Adding webhook to contact creation
export async function createContactWithWebhook(req: any, res: any) {
  try {
    const { userId, workspaceId } = getUserData(req);
    
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'Workspace ID is required' });
    }
    
    // Create the contact (existing logic)
    const contact = await createContactAdvanced(workspaceId, userId, req.body);
    
    // Dispatch webhook event
    await webhookEventDispatcher.dispatchContactCreated(workspaceId, contact);
    
    res.status(201).json({ success: true, data: contact });
  } catch (error: any) {
    console.error('Create contact error:', error);
    res.status(500).json({ success: false, error: 'Failed to create contact' });
  }
}

// Example 2: Adding webhook to contact update
export async function updateContactWithWebhook(req: any, res: any) {
  try {
    const { userId, workspaceId } = getUserData(req);
    const { id } = req.params;
    
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'Workspace ID is required' });
    }
    
    // Update the contact (existing logic)
    const contact = await updateContact(id, userId, workspaceId, req.body);
    
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }
    
    // Dispatch webhook event
    await webhookEventDispatcher.dispatchContactUpdated(workspaceId, contact);
    
    res.json({ success: true, data: contact });
  } catch (error: any) {
    console.error('Update contact error:', error);
    res.status(500).json({ success: false, error: 'Failed to update contact' });
  }
}

// Example 3: Adding webhook to contact deletion
export async function deleteContactWithWebhook(req: any, res: any) {
  try {
    const { userId, workspaceId } = getUserData(req);
    const { id } = req.params;
    
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'Workspace ID is required' });
    }
    
    // Delete the contact (existing logic)
    const success = await deleteContact(id, userId, workspaceId);
    
    if (!success) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }
    
    // Dispatch webhook event
    await webhookEventDispatcher.dispatchContactDeleted(workspaceId, id);
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Delete contact error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete contact' });
  }
}

// Example 4: Adding webhook to transaction creation
export async function createTransactionWithWebhook(req: any, res: any) {
  try {
    const { userId, workspaceId } = getUserData(req);
    
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'Workspace ID is required' });
    }
    
    // Create the transaction (existing logic)
    const transaction = await createTransaction(workspaceId, userId, req.body);
    
    // Dispatch webhook event
    await webhookEventDispatcher.dispatchTransactionCreated(workspaceId, transaction);
    
    res.status(201).json({ success: true, data: transaction });
  } catch (error: any) {
    console.error('Create transaction error:', error);
    res.status(500).json({ success: false, error: 'Failed to create transaction' });
  }
}

// Example 5: Batch webhook events
export async function batchCreateContactsWithWebhook(req: any, res: any) {
  try {
    const { userId, workspaceId } = getUserData(req);
    const { contacts } = req.body;
    
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'Workspace ID is required' });
    }
    
    const createdContacts = [];
    
    for (const contactData of contacts) {
      // Create the contact (existing logic)
      const contact = await createContactAdvanced(workspaceId, userId, contactData);
      createdContacts.push(contact);
      
      // Dispatch webhook event for each contact
      await webhookEventDispatcher.dispatchContactCreated(workspaceId, contact);
    }
    
    res.status(201).json({ success: true, data: createdContacts });
  } catch (error: any) {
    console.error('Batch create contacts error:', error);
    res.status(500).json({ success: false, error: 'Failed to create contacts' });
  }
}

// Helper function to extract user data from request
function getUserData(req: any) {
  const user = req.user as { userId: string; workspaceId: string };
  if (!user?.userId || !user?.workspaceId) {
    throw new Error('Invalid user authentication data');
  }
  return {
    userId: user.userId,
    workspaceId: user.workspaceId
  };
}

// Note: You would need to import these functions in your existing controllers:
// import { createContactAdvanced, updateContact, deleteContact } from './service';
// import { createTransaction } from '../transactions/service';
