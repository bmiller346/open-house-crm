import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  ApiResponse,
  Contact,
  Property,
  Transaction,
  Campaign,
  User,
  Workspace,
  Pipeline,
  SearchParams,
  PaginationInfo
} from '../../../../packages/core/src/types';

export interface OpenHouseCRMConfig {
  baseURL: string;
  apiKey?: string;
  token?: string;
  timeout?: number;
}

export class OpenHouseCRMClient {
  private client: AxiosInstance;
  private config: OpenHouseCRMConfig;

  constructor(config: OpenHouseCRMConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'X-API-Key': config.apiKey }),
        ...(config.token && { 'Authorization': `Bearer ${config.token}` }),
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error(`[API Error] ${error.response?.status} ${error.response?.statusText}`);
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await this.client.post('/auth/login', { email, password });
    const { token, user } = response.data.data;
    
    // Update client with new token
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return { token, user };
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    workspaceName: string;
  }): Promise<{ token: string; user: User; workspace: Workspace }> {
    const response = await this.client.post('/auth/register', userData);
    return response.data.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Workspace methods
  async getWorkspaces(): Promise<Workspace[]> {
    const response = await this.client.get('/workspaces');
    return response.data.data;
  }

  async createWorkspace(workspace: Partial<Workspace>): Promise<Workspace> {
    const response = await this.client.post('/workspaces', workspace);
    return response.data.data;
  }

  // Contact methods
  async getContacts(params?: SearchParams): Promise<ApiResponse<Contact[]>> {
    const response = await this.client.get('/contacts', { params });
    return response.data;
  }

  async getContact(id: string): Promise<Contact> {
    const response = await this.client.get(`/contacts/${id}`);
    return response.data.data;
  }

  async createContact(contact: Partial<Contact>): Promise<Contact> {
    const response = await this.client.post('/contacts', contact);
    return response.data.data;
  }

  async updateContact(id: string, contact: Partial<Contact>): Promise<Contact> {
    const response = await this.client.put(`/contacts/${id}`, contact);
    return response.data.data;
  }

  async deleteContact(id: string): Promise<void> {
    await this.client.delete(`/contacts/${id}`);
  }

  // Property methods
  async getProperties(params?: SearchParams): Promise<ApiResponse<Property[]>> {
    const response = await this.client.get('/properties', { params });
    return response.data;
  }

  async getProperty(id: string): Promise<Property> {
    const response = await this.client.get(`/properties/${id}`);
    return response.data.data;
  }

  async createProperty(property: Partial<Property>): Promise<Property> {
    const response = await this.client.post('/properties', property);
    return response.data.data;
  }

  async updateProperty(id: string, property: Partial<Property>): Promise<Property> {
    const response = await this.client.put(`/properties/${id}`, property);
    return response.data.data;
  }

  async deleteProperty(id: string): Promise<void> {
    await this.client.delete(`/properties/${id}`);
  }

  // Transaction methods
  async getTransactions(params?: SearchParams): Promise<ApiResponse<Transaction[]>> {
    const response = await this.client.get('/transactions', { params });
    return response.data;
  }

  async getTransaction(id: string): Promise<Transaction> {
    const response = await this.client.get(`/transactions/${id}`);
    return response.data.data;
  }

  async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
    const response = await this.client.post('/transactions', transaction);
    return response.data.data;
  }

  async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction> {
    const response = await this.client.put(`/transactions/${id}`, transaction);
    return response.data.data;
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.client.delete(`/transactions/${id}`);
  }

  // Pipeline methods
  async getPipelines(): Promise<Pipeline[]> {
    const response = await this.client.get('/pipelines');
    return response.data.data;
  }

  async createPipeline(pipeline: Partial<Pipeline>): Promise<Pipeline> {
    const response = await this.client.post('/pipelines', pipeline);
    return response.data.data;
  }

  async updatePipeline(id: string, pipeline: Partial<Pipeline>): Promise<Pipeline> {
    const response = await this.client.put(`/pipelines/${id}`, pipeline);
    return response.data.data;
  }

  // Campaign methods
  async getCampaigns(params?: SearchParams): Promise<ApiResponse<Campaign[]>> {
    const response = await this.client.get('/campaigns', { params });
    return response.data;
  }

  async getCampaign(id: string): Promise<Campaign> {
    const response = await this.client.get(`/campaigns/${id}`);
    return response.data.data;
  }

  async createCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
    const response = await this.client.post('/campaigns', campaign);
    return response.data.data;
  }

  async updateCampaign(id: string, campaign: Partial<Campaign>): Promise<Campaign> {
    const response = await this.client.put(`/campaigns/${id}`, campaign);
    return response.data.data;
  }

  async deleteCampaign(id: string): Promise<void> {
    await this.client.delete(`/campaigns/${id}`);
  }

  // Analytics methods
  async getAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    metrics?: string[];
  }): Promise<any> {
    const response = await this.client.get('/analytics', { params });
    return response.data.data;
  }

  async getDashboardStats(): Promise<any> {
    const response = await this.client.get('/analytics/dashboard');
    return response.data.data;
  }

  // Document methods
  async uploadDocument(file: File | Buffer, metadata?: {
    name?: string;
    type?: string;
    entityId?: string;
    entityType?: string;
  }): Promise<any> {
    const formData = new FormData();
    formData.append('file', file as Blob);
    
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
    }

    const response = await this.client.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data;
  }

  async getDocuments(params?: SearchParams): Promise<any> {
    const response = await this.client.get('/documents', { params });
    return response.data;
  }

  // Calendar methods
  async getAppointments(params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }): Promise<any> {
    const response = await this.client.get('/calendar/appointments', { params });
    return response.data.data;
  }

  async createAppointment(appointment: any): Promise<any> {
    const response = await this.client.post('/calendar/appointments', appointment);
    return response.data.data;
  }

  // AI/ML methods
  async getLeadScore(contactId: string): Promise<any> {
    const response = await this.client.get(`/ai/lead-score/${contactId}`);
    return response.data.data;
  }

  async getPropertyValueEstimate(propertyId: string): Promise<any> {
    const response = await this.client.get(`/ai/property-value/${propertyId}`);
    return response.data.data;
  }

  async getMarketInsights(area: {
    city: string;
    state: string;
    zipCode?: string;
  }): Promise<any> {
    const response = await this.client.get('/ai/market-insights', { params: area });
    return response.data.data;
  }

  // Generic HTTP methods for custom endpoints
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete(url, config);
  }
}

// Export a factory function for easy setup
export const createOpenHouseCRMClient = (config: OpenHouseCRMConfig): OpenHouseCRMClient => {
  return new OpenHouseCRMClient(config);
};

// Export default instance factory
export default createOpenHouseCRMClient;
