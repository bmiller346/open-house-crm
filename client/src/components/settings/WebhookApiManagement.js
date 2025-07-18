import React, { useState } from 'react';
import './settings.module.css';

interface WebhookApiManagementProps {
  // Component props
}

// Mock implementation for the WebhookApiManagement component
const WebhookApiManagement: React.FC<WebhookApiManagementProps> = () => {
  const [activeTab, setActiveTab] = useState<'webhooks' | 'api-keys'>('webhooks');
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock functions for now
  const loadWebhooks = async () => {
    setIsLoading(true);
    // Implementation would be added when UI components are available
    setIsLoading(false);
  };

  const loadApiKeys = async () => {
    setIsLoading(true);
    // Implementation would be added when UI components are available
    setIsLoading(false);
  };

  const createWebhook = async (data: any) => {
    // Implementation would be added when UI components are available
    console.log('Creating webhook:', data);
  };

  const createApiKey = async (data: any) => {
    // Implementation would be added when UI components are available
    console.log('Creating API key:', data);
  };

  return (
    <div className="webhook-api-management">
      <div className="header">
        <h1>API & Webhook Management</h1>
        <p>Manage your webhooks and API keys for external integrations</p>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'webhooks' ? 'active' : ''}
          onClick={() => setActiveTab('webhooks')}
        >
          Webhooks
        </button>
        <button
          className={activeTab === 'api-keys' ? 'active' : ''}
          onClick={() => setActiveTab('api-keys')}
        >
          API Keys
        </button>
      </div>

      {activeTab === 'webhooks' && (
        <div className="webhooks-section">
          <div className="section-header">
            <h2>Webhooks</h2>
            <button className="create-btn" onClick={() => console.log('Create webhook')}>
              Create Webhook
            </button>
          </div>
          
          <div className="webhook-grid">
            {webhooks.length === 0 ? (
              <div className="empty-state">
                <p>No webhooks configured yet. Create your first webhook to get started.</p>
              </div>
            ) : (
              webhooks.map((webhook) => (
                <div key={webhook.id} className="webhook-card">
                  <h3>{webhook.name}</h3>
                  <p className="webhook-url">{webhook.url}</p>
                  <div className="webhook-status">
                    <span className={`status ${webhook.isActive ? 'active' : 'inactive'}`}>
                      {webhook.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'api-keys' && (
        <div className="api-keys-section">
          <div className="section-header">
            <h2>API Keys</h2>
            <button className="create-btn" onClick={() => console.log('Create API key')}>
              Create API Key
            </button>
          </div>
          
          <div className="api-key-grid">
            {apiKeys.length === 0 ? (
              <div className="empty-state">
                <p>No API keys created yet. Create your first API key to get started.</p>
              </div>
            ) : (
              apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="api-key-card">
                  <h3>{apiKey.name}</h3>
                  <p className="api-key-prefix">{apiKey.keyPrefix}</p>
                  <div className="api-key-status">
                    <span className={`status ${apiKey.isActive ? 'active' : 'inactive'}`}>
                      {apiKey.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebhookApiManagement;
