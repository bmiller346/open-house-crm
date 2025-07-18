import { Request, Response } from 'express';
import { 
  listContacts, 
  getContact, 
  createContact, 
  updateContact, 
  deleteContact,
  // Enhanced functions
  createContactAdvanced,
  updateContactAdvanced,
  searchContacts,
  calculateLeadScore,
  checkDuplicates,
  getContactRecommendations
} from './service';

// Helper function to extract user data from request
function getUserData(req: Request) {
  // Cast authenticated payload
  const user = req.user as { userId: string; workspaceId: string };
  console.log('🔍 User data:', JSON.stringify(user, null, 2));
  if (!user?.userId || !user?.workspaceId) {
    throw new Error('Invalid user authentication data');
  }
  return {
    userId: user.userId,
    workspaceId: user.workspaceId
  };
}

export async function getContactsHandler(req: Request, res: Response) {
  try {
    const { userId, workspaceId } = getUserData(req);
    
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'Workspace ID is required' });
    }
    
    const contacts = await listContacts(userId, workspaceId);
    res.json({ success: true, data: contacts });
  } catch (error: any) {
    console.error('Get contacts error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch contacts' });
  }
}

export async function getContactHandler(req: Request, res: Response) {
  try {
    const { userId, workspaceId } = getUserData(req);
    const { id } = req.params;
    
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'Workspace ID is required' });
    }
    
    const contact = await getContact(id, userId, workspaceId);
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }
    res.json({ success: true, data: contact });
  } catch (error: any) {
    console.error('Get contact error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch contact' });
  }
}

export async function createContactHandler(req: Request, res: Response) {
  try {
    const { userId, workspaceId } = getUserData(req);
    
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'Workspace ID is required' });
    }
    
    const contact = await createContactAdvanced(workspaceId, userId, req.body);
    res.status(201).json({ success: true, data: contact });
  } catch (error: any) {
    console.error('Create contact error:', error);
    res.status(500).json({ success: false, error: 'Failed to create contact' });
  }
}

export async function updateContactHandler(req: Request, res: Response) {
  try {
    const { userId, workspaceId } = getUserData(req);
    const { id } = req.params;
    
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'Workspace ID is required' });
    }
    
    const contact = await updateContact(id, userId, workspaceId, req.body);
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }
    res.json({ success: true, data: contact });
  } catch (error: any) {
    console.error('Update contact error:', error);
    res.status(500).json({ success: false, error: 'Failed to update contact' });
  }
}

export async function deleteContactHandler(req: Request, res: Response) {
  try {
    const { userId, workspaceId } = getUserData(req);
    const { id } = req.params;
    
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'Workspace ID is required' });
    }
    
    await deleteContact(id, userId, workspaceId);
    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error: any) {
    console.error('Delete contact error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete contact' });
  }
}

// Enhanced Contact Management Endpoints

export async function createContactAdvancedHandler(req: Request, res: Response) {
  try {
    const { userId, workspaceId } = getUserData(req);
    
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'Workspace ID is required' });
    }
    
    const contact = await createContactAdvanced(workspaceId, userId, req.body);
    res.status(201).json({ success: true, data: contact });
  } catch (error: any) {
    console.error('Create contact advanced error:', error);
    res.status(500).json({ success: false, error: 'Failed to create contact' });
  }
}

export async function searchContactsHandler(req: Request, res: Response) {
  try {
    const { userId, workspaceId } = getUserData(req);
    
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'Workspace ID is required' });
    }
    
    const { query, filters, sortBy, sortOrder, page, limit } = req.query;
    
    const result = await searchContacts(
      workspaceId,
      filters ? JSON.parse(filters as string) : {},
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20
    );
    
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Search contacts error:', error);
    res.status(500).json({ success: false, error: 'Failed to search contacts' });
  }
}

export async function calculateLeadScoreHandler(req: Request, res: Response) {
  try {
    const { userId, workspaceId } = getUserData(req);
    const { id } = req.params;
    
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'Workspace ID is required' });
    }
    
    const score = await calculateLeadScore(id);
    res.json({ success: true, data: score });
  } catch (error: any) {
    console.error('Calculate lead score error:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate lead score' });
  }
}

export async function checkDuplicatesHandler(req: Request, res: Response) {
  try {
    const { userId, workspaceId } = getUserData(req);
    
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'Workspace ID is required' });
    }
    
    const { email, phone, firstName, lastName } = req.body;
    const duplicates = await checkDuplicates(workspaceId, { email, phone, firstName, lastName });
    res.json({ success: true, data: duplicates });
  } catch (error: any) {
    console.error('Check duplicates error:', error);
    res.status(500).json({ success: false, error: 'Failed to check duplicates' });
  }
}

export async function getContactRecommendationsHandler(req: Request, res: Response) {
  try {
    const { userId, workspaceId } = getUserData(req);
    const { id } = req.params;
    
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'Workspace ID is required' });
    }
    
    const recommendations = await getContactRecommendations(workspaceId);
    res.json({ success: true, data: recommendations });
  } catch (error: any) {
    console.error('Get contact recommendations error:', error);
    res.status(500).json({ success: false, error: 'Failed to get contact recommendations' });
  }
}

// Bulk operations
export async function bulkUpdateContactsHandler(req: Request, res: Response) {
  try {
    const { userId, workspaceId } = getUserData(req);
    const { contactIds, updates } = req.body;
    
    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'contactIds array is required' 
      });
    }

    const results = [];
    for (const contactId of contactIds) {
      try {
        const updated = await updateContactAdvanced(contactId, userId, updates);
        results.push({ contactId, success: true, data: updated });
      } catch (error: any) {
        results.push({ contactId, success: false, error: error.message });
      }
    }

    res.json({ success: true, data: results });
  } catch (error: any) {
    console.error('Bulk update contacts error:', error);
    res.status(500).json({ success: false, error: 'Failed to bulk update contacts' });
  }
}

export async function getContactAnalyticsHandler(req: Request, res: Response) {
  try {
    const { userId, workspaceId } = getUserData(req);
    
    // Get all contacts for analytics
    const { contacts, total } = await searchContacts(workspaceId, {}, 1, 1000);
    
    // Calculate analytics
    const analytics = {
      total,
      byType: contacts.reduce((acc, contact) => {
        acc[contact.type] = (acc[contact.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byStatus: contacts.reduce((acc, contact) => {
        acc[contact.status] = (acc[contact.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySource: contacts.reduce((acc, contact) => {
        acc[contact.source || 'unknown'] = (acc[contact.source || 'unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      averageLeadScore: contacts.reduce((sum, c) => sum + (c.leadScore || 0), 0) / contacts.length,
      highValueContacts: contacts.filter(c => c.isHighValue).length,
      needingFollowUp: contacts.filter(c => c.needsFollowUp).length,
      recentlyAdded: contacts.filter(c => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return c.createdAt > weekAgo;
      }).length
    };

    res.json({ success: true, data: analytics });
  } catch (error: any) {
    console.error('Get contact analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to get analytics' });
  }
}
