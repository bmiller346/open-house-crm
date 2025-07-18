import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  // Basic CRUD (legacy compatibility)
  getContactsHandler,
  getContactHandler,
  createContactHandler,
  updateContactHandler,
  deleteContactHandler,
  // Enhanced CRM functions
  createContactAdvancedHandler,
  searchContactsHandler,
  calculateLeadScoreHandler,
  checkDuplicatesHandler,
  getContactRecommendationsHandler,
  bulkUpdateContactsHandler,
  getContactAnalyticsHandler
} from '../features/contacts/controller';

const router = Router();

// Legacy API endpoints (maintaining backward compatibility)
router.get('/', authMiddleware, getContactsHandler);
router.get('/:contactId', authMiddleware, getContactHandler);
router.post('/', authMiddleware, createContactHandler);
router.put('/:contactId', authMiddleware, updateContactHandler);
router.delete('/:contactId', authMiddleware, deleteContactHandler);

// Enhanced CRM endpoints with advanced features
router.post('/advanced', authMiddleware, createContactAdvancedHandler);
router.get('/search/all', authMiddleware, searchContactsHandler);
router.post('/:contactId/lead-score', authMiddleware, calculateLeadScoreHandler);
router.post('/check-duplicates', authMiddleware, checkDuplicatesHandler);
router.get('/recommendations/all', authMiddleware, getContactRecommendationsHandler);
router.put('/bulk/update', authMiddleware, bulkUpdateContactsHandler);
router.get('/analytics/dashboard', authMiddleware, getContactAnalyticsHandler);

export default router;
