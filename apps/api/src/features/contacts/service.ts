// Enhanced Contacts service with AI-powered lead scoring
import type { Contact as ContactType } from './types';
import { Repository } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { Contact as ContactEntity, ContactType as ContactTypeEnum, ContactStatus, ContactSource, PreferredContact } from '../../entities/Contact';
// import { LeadScore } from '../../entities/LeadScore'; // Temporarily disabled due to decorator issue

interface ContactFilters {
  search?: string;
  type?: ContactTypeEnum;
  status?: ContactStatus;
  source?: ContactSource;
  tags?: string[];
  leadScoreMin?: number;
  leadScoreMax?: number;
  budgetMin?: number;
  budgetMax?: number;
  city?: string;
  state?: string;
  needsFollowUp?: boolean;
  highValue?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

interface ContactCreateData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  type?: ContactTypeEnum;
  status?: ContactStatus;
  source?: ContactSource;
  companyName?: string;
  jobTitle?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  budgetMin?: number;
  budgetMax?: number;
  propertyType?: string;
  moveTimeline?: string;
  notes?: string;
  tags?: string[];
  preferredContact?: PreferredContact;
  emailOptIn?: boolean;
  smsOptIn?: boolean;
  customFields?: Record<string, any>;
}

interface LeadScoringResult {
  score: number;
  factors: Array<{
    factor: string;
    weight: number;
    value: any;
    points: number;
  }>;
  recommendations: string[];
}

// Legacy compatibility functions
export async function listContacts(userId: string, workspaceId: string): Promise<ContactEntity[]> {
  const { contacts } = await searchContacts(workspaceId, {}, 1, 100);
  return contacts;
}

export async function getContact(contactId: string, userId: string, workspaceId: string): Promise<ContactEntity | null> {
  return getContactById(contactId);
}

export async function createContact(data: {
  name: string;
  email: string;
  phone?: string;
  workspaceId: string;
}): Promise<ContactEntity> {
  // Parse name into first and last name
  const nameParts = data.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return createContactAdvanced(data.workspaceId, 'system', {
    firstName,
    lastName,
    email: data.email,
    phone: data.phone
  });
}

export async function updateContact(contactId: string, userId: string, workspaceId: string, updates: Partial<ContactType>): Promise<ContactEntity> {
  return updateContactAdvanced(contactId, userId, updates);
}

export async function deleteContact(contactId: string, userId: string, workspaceId: string): Promise<void> {
  return deleteContactById(contactId);
}

// Enhanced Contact Management Functions
export async function createContactAdvanced(workspaceId: string, userId: string, data: ContactCreateData): Promise<ContactEntity> {
  const contactRepository = AppDataSource.getRepository(ContactEntity);

  // Check for duplicates
  const duplicateCheck = await checkDuplicates(workspaceId, data);
  if (duplicateCheck.isDuplicate && duplicateCheck.confidence > 0.8) {
    throw new Error(`Potential duplicate contact found: ${duplicateCheck.existingContact?.displayName}`);
  }

  // Create contact with proper field mapping
  const contactData: Partial<ContactEntity> = {
    ...data,
    workspaceId,
    createdBy: userId,
    updatedBy: userId,
  };

  const contact = contactRepository.create(contactData);
  const savedContact = await contactRepository.save(contact);

  // Calculate initial lead score
  await calculateLeadScore(savedContact.id);

  return savedContact;
}

export async function updateContactAdvanced(contactId: string, userId: string, data: Partial<ContactCreateData>): Promise<ContactEntity> {
  const contactRepository = AppDataSource.getRepository(ContactEntity);
  
  const contact = await contactRepository.findOne({
    where: { id: contactId },
    relations: [] // 'appointments', 'leadScores' temporarily disabled
  });

  if (!contact) {
    throw new Error('Contact not found');
  }

  Object.assign(contact, { ...data, updatedBy: userId });
  const updatedContact = await contactRepository.save(contact);

  // Recalculate lead score if relevant fields changed
  const scoringFields = ['type', 'status', 'budgetMin', 'budgetMax', 'moveTimeline', 'lastContactDate'];
  if (scoringFields.some(field => field in data)) {
    await calculateLeadScore(contactId);
  }

  return updatedContact;
}

export async function deleteContactById(contactId: string): Promise<void> {
  const contactRepository = AppDataSource.getRepository(ContactEntity);
  const contact = await contactRepository.findOne({ where: { id: contactId } });
  if (!contact) {
    throw new Error('Contact not found');
  }
  await contactRepository.remove(contact);
}

export async function getContactById(contactId: string): Promise<ContactEntity | null> {
  const contactRepository = AppDataSource.getRepository(ContactEntity);
  return contactRepository.findOne({
    where: { id: contactId },
    relations: ['workspace'] // 'appointments', 'leadScores' temporarily disabled
  });
}

// Advanced Search and Filtering
export async function searchContacts(workspaceId: string, filters: ContactFilters = {}, page = 1, limit = 20): Promise<{
  contacts: ContactEntity[];
  total: number;
  hasMore: boolean;
}> {
  const contactRepository = AppDataSource.getRepository(ContactEntity);
  const queryBuilder = contactRepository.createQueryBuilder('contact')
    .where('contact.workspaceId = :workspaceId', { workspaceId })
    // .leftJoinAndSelect('contact.appointments', 'appointments') // Temporarily disabled
    // .leftJoinAndSelect('contact.leadScores', 'leadScores'); // Temporarily disabled

  // Text search across multiple fields
  if (filters.search) {
    queryBuilder.andWhere(`
      (LOWER(contact.firstName) LIKE LOWER(:search) OR 
       LOWER(contact.lastName) LIKE LOWER(:search) OR 
       LOWER(contact.email) LIKE LOWER(:search) OR 
       LOWER(contact.phone) LIKE LOWER(:search) OR 
       LOWER(contact.companyName) LIKE LOWER(:search))
    `, { search: `%${filters.search}%` });
  }

  // Apply filters
  if (filters.type) {
    queryBuilder.andWhere('contact.type = :type', { type: filters.type });
  }
  if (filters.status) {
    queryBuilder.andWhere('contact.status = :status', { status: filters.status });
  }
  if (filters.source) {
    queryBuilder.andWhere('contact.source = :source', { source: filters.source });
  }
  if (filters.leadScoreMin !== undefined) {
    queryBuilder.andWhere('contact.leadScore >= :leadScoreMin', { leadScoreMin: filters.leadScoreMin });
  }
  if (filters.leadScoreMax !== undefined) {
    queryBuilder.andWhere('contact.leadScore <= :leadScoreMax', { leadScoreMax: filters.leadScoreMax });
  }
  if (filters.budgetMin !== undefined) {
    queryBuilder.andWhere('contact.budgetMax >= :budgetMin', { budgetMin: filters.budgetMin });
  }
  if (filters.budgetMax !== undefined) {
    queryBuilder.andWhere('contact.budgetMin <= :budgetMax', { budgetMax: filters.budgetMax });
  }
  if (filters.city) {
    queryBuilder.andWhere('LOWER(contact.city) = LOWER(:city)', { city: filters.city });
  }
  if (filters.state) {
    queryBuilder.andWhere('LOWER(contact.state) = LOWER(:state)', { state: filters.state });
  }
  if (filters.tags && filters.tags.length > 0) {
    queryBuilder.andWhere('contact.tags ?| array[:...tags]', { tags: filters.tags });
  }
  if (filters.needsFollowUp) {
    queryBuilder.andWhere('contact.nextFollowUp <= :now', { now: new Date() });
  }
  if (filters.highValue) {
    queryBuilder.andWhere('(contact.leadScore > 80 OR contact.conversionProbability > 0.7)');
  }
  if (filters.createdAfter) {
    queryBuilder.andWhere('contact.createdAt >= :createdAfter', { createdAfter: filters.createdAfter });
  }
  if (filters.createdBefore) {
    queryBuilder.andWhere('contact.createdAt <= :createdBefore', { createdBefore: filters.createdBefore });
  }

  // Pagination
  const offset = (page - 1) * limit;
  queryBuilder.skip(offset).take(limit);

  // Ordering
  queryBuilder.orderBy('contact.leadScore', 'DESC')
              .addOrderBy('contact.lastContactDate', 'ASC')
              .addOrderBy('contact.createdAt', 'DESC');

  const [contacts, total] = await queryBuilder.getManyAndCount();

  return {
    contacts,
    total,
    hasMore: offset + contacts.length < total
  };
}

// AI-Powered Lead Scoring
export async function calculateLeadScore(contactId: string): Promise<LeadScoringResult> {
  const contact = await getContactById(contactId);
  if (!contact) {
    throw new Error('Contact not found');
  }

  // const leadScoreRepository = AppDataSource.getRepository(LeadScore); // Temporarily disabled
  const factors: Array<{
    factor: string;
    weight: number;
    value: any;
    points: number;
  }> = [];

  let totalScore = 0;

  // Budget factor (25% weight)
  if (contact.budgetMin && contact.budgetMax) {
    const avgBudget = (contact.budgetMin + contact.budgetMax) / 2;
    let budgetPoints = 0;
    if (avgBudget >= 1000000) budgetPoints = 25;
    else if (avgBudget >= 500000) budgetPoints = 20;
    else if (avgBudget >= 300000) budgetPoints = 15;
    else if (avgBudget >= 200000) budgetPoints = 10;
    else budgetPoints = 5;

    factors.push({
      factor: 'Budget Range',
      weight: 0.25,
      value: contact.budgetRange,
      points: budgetPoints
    });
    totalScore += budgetPoints;
  }

  // Timeline factor (20% weight)
  if (contact.moveTimeline) {
    let timelinePoints = 0;
    const timeline = contact.moveTimeline.toLowerCase();
    if (timeline.includes('immediately') || timeline.includes('asap')) timelinePoints = 20;
    else if (timeline.includes('1-3 months')) timelinePoints = 18;
    else if (timeline.includes('3-6 months')) timelinePoints = 15;
    else if (timeline.includes('6-12 months')) timelinePoints = 10;
    else timelinePoints = 5;

    factors.push({
      factor: 'Move Timeline',
      weight: 0.20,
      value: contact.moveTimeline,
      points: timelinePoints
    });
    totalScore += timelinePoints;
  }

  // Contact engagement (20% weight)
  let engagementPoints = 0;
  if (contact.emailOptIn) engagementPoints += 5;
  if (contact.smsOptIn) engagementPoints += 5;
  // if (contact.appointments && contact.appointments.length > 0) engagementPoints += 10; // Temporarily disabled

  const daysSinceContact = contact.daysSinceLastContact;
  if (daysSinceContact < 7) engagementPoints += 5;
  else if (daysSinceContact < 30) engagementPoints += 3;
  else if (daysSinceContact > 90) engagementPoints -= 5;

  factors.push({
    factor: 'Engagement Level',
    weight: 0.20,
    value: `0 appointments, ${daysSinceContact} days since contact`, // Appointments temporarily disabled
    points: Math.max(0, engagementPoints)
  });
  totalScore += Math.max(0, engagementPoints);

  // Contact type and status (15% weight)
  let typeStatusPoints = 0;
  if (contact.type === ContactTypeEnum.CLIENT) typeStatusPoints = 15;
  else if (contact.type === ContactTypeEnum.PROSPECT) typeStatusPoints = 12;
  else if (contact.type === ContactTypeEnum.LEAD) typeStatusPoints = 8;

  if (contact.status === ContactStatus.ACTIVE) typeStatusPoints += 5;
  else if (contact.status === ContactStatus.NURTURING) typeStatusPoints += 3;

  factors.push({
    factor: 'Contact Type & Status',
    weight: 0.15,
    value: `${contact.type} - ${contact.status}`,
    points: typeStatusPoints
  });
  totalScore += typeStatusPoints;

  // Demographics and profile completeness (10% weight)
  let profilePoints = 0;
  const completedFields = [
    contact.phone, contact.streetAddress, contact.city, contact.state,
    contact.jobTitle, contact.companyName, contact.preferredAreas
  ].filter(Boolean).length;

  profilePoints = Math.round((completedFields / 7) * 10);

  factors.push({
    factor: 'Profile Completeness',
    weight: 0.10,
    value: `${completedFields}/7 fields completed`,
    points: profilePoints
  });
  totalScore += profilePoints;

  // Pre-qualification factors (10% weight)
  let qualificationPoints = 0;
  if (contact.isFirstTimeBuyer && contact.budgetMin && contact.budgetMin > 200000) qualificationPoints += 5;
  if (contact.needsToSell && contact.currentHomeValue) qualificationPoints += 5;
  if (contact.preferredAreas && contact.preferredAreas.length > 0) qualificationPoints += 3;

  factors.push({
    factor: 'Pre-qualification',
    weight: 0.10,
    value: `First-time buyer: ${contact.isFirstTimeBuyer}, Needs to sell: ${contact.needsToSell}`,
    points: qualificationPoints
  });
  totalScore += qualificationPoints;

  // Cap at 100 points
  totalScore = Math.min(100, totalScore);

  // Generate recommendations
  const recommendations: string[] = [];
  if (totalScore > 80) {
    recommendations.push('🔥 High-priority lead! Schedule immediate follow-up.');
  }
  if (contact.daysSinceLastContact > 30) {
    recommendations.push('⏰ Overdue for contact - reach out soon to maintain engagement.');
  }
  if (!contact.phone) {
    recommendations.push('📞 Missing phone number - consider obtaining for better communication.');
  }
  if (contact.budgetMin && contact.moveTimeline?.includes('immediately')) {
    recommendations.push('🏠 Ready buyer with budget - prioritize property showings.');
  }
  if (contact.needsToSell && !contact.currentHomeValue) {
    recommendations.push('💰 Get home valuation to better assist with selling process.');
  }

  // Update contact with new score
  const contactRepository = AppDataSource.getRepository(ContactEntity);
  await contactRepository.update(contact.id, {
    leadScore: totalScore,
    conversionProbability: totalScore / 100
  });

  // Save scoring details
  const leadScoreData = {
    contactId: contact.id,
    workspaceId: contact.workspaceId,
    score: totalScore,
    category: (totalScore > 80 ? 'hot' : totalScore > 60 ? 'warm' : 'cold') as 'hot' | 'warm' | 'cold' | 'qualified' | 'unqualified',
    confidence: Math.round(factors.length * 20), // Base confidence on number of factors
    factors: {
      demographic: factors.find(f => f.factor === 'Profile Completeness')?.points || 0,
      behavioral: factors.find(f => f.factor === 'Engagement Level')?.points || 0,
      engagement: factors.find(f => f.factor === 'Engagement Level')?.points || 0,
      financial: factors.find(f => f.factor === 'Budget Range')?.points || 0,
      timing: factors.find(f => f.factor === 'Move Timeline')?.points || 0,
      intent: factors.find(f => f.factor === 'Pre-qualification')?.points || 0,
    },
    insights: {
      strengths: factors.filter(f => f.points > 15).map(f => f.factor),
      weaknesses: factors.filter(f => f.points < 5).map(f => f.factor),
      recommendations,
      nextBestAction: recommendations[0] || 'Schedule follow-up call',
      estimatedCloseTime: totalScore > 80 ? 30 : totalScore > 60 ? 60 : 90,
      estimatedValue: contact.budgetMax || contact.budgetMin || 0
    },
    metadata: {
      modelVersion: 'v1.0',
      computedAt: new Date(),
      dataPoints: factors.length,
      lastActivityDate: contact.lastContactDate,
      sourceChannels: [contact.source || 'unknown']
    }
  };

  // await leadScoreRepository.save(leadScoreData); // Temporarily disabled

  return {
    score: totalScore,
    factors,
    recommendations
  };
}

// Duplicate Detection
export async function checkDuplicates(workspaceId: string, contactData: ContactCreateData): Promise<{
  isDuplicate: boolean;
  existingContact?: ContactEntity;
  matchType: 'exact' | 'email' | 'phone' | 'name_address';
  confidence: number;
}> {
  const contactRepository = AppDataSource.getRepository(ContactEntity);

  // Exact email match
  if (contactData.email) {
    const emailMatch = await contactRepository.findOne({
      where: { workspaceId, email: contactData.email }
    });

    if (emailMatch) {
      return {
        isDuplicate: true,
        existingContact: emailMatch,
        matchType: 'email',
        confidence: 1.0
      };
    }
  }

  // Phone number match
  if (contactData.phone) {
    const phoneMatch = await contactRepository.findOne({
      where: { workspaceId, phone: contactData.phone }
    });

    if (phoneMatch) {
      return {
        isDuplicate: true,
        existingContact: phoneMatch,
        matchType: 'phone',
        confidence: 0.9
      };
    }
  }

  return {
    isDuplicate: false,
    matchType: 'exact',
    confidence: 0
  };
}

// Smart Recommendations
export async function getContactRecommendations(workspaceId: string): Promise<{
  highPriority: ContactEntity[];
  needsFollowUp: ContactEntity[];
  recentlyActive: ContactEntity[];
  coldLeads: ContactEntity[];
}> {
  const contactRepository = AppDataSource.getRepository(ContactEntity);
  const contacts = await contactRepository.find({
    where: { workspaceId },
    relations: [] // 'appointments' temporarily disabled
  });

  const highPriority = contacts
    .filter(c => c.leadScore > 80 || c.isHighValue)
    .sort((a, b) => b.leadScore - a.leadScore)
    .slice(0, 10);

  const needsFollowUp = contacts
    .filter(c => c.needsFollowUp)
    .sort((a, b) => a.daysSinceLastContact - b.daysSinceLastContact)
    .slice(0, 10);

  const recentlyActive = contacts
    .filter(c => c.daysSinceLastContact <= 7)
    .sort((a, b) => a.daysSinceLastContact - b.daysSinceLastContact)
    .slice(0, 10);

  const coldLeads = contacts
    .filter(c => c.daysSinceLastContact > 90 && c.status === ContactStatus.ACTIVE)
    .sort((a, b) => b.daysSinceLastContact - a.daysSinceLastContact)
    .slice(0, 10);

  return {
    highPriority,
    needsFollowUp,
    recentlyActive,
    coldLeads
  };
}
