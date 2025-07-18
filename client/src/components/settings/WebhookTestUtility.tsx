import React, { useState, useEffect } from 'react';
import styles from './settings.module.css';

interface WebhookTestUtilityProps {
  webhookId?: string;
  webhookUrl?: string;
  onTestComplete?: (result: WebhookTestResult) => void;
}

interface WebhookTestResult {
  success: boolean;
  statusCode?: number;
  responseTime?: number;
  error?: string;
  responseBody?: string;
  requestId?: string;
}

interface TestPayload {
  event: string;
  data: any;
  timestamp: string;
}

const WebhookTestUtility: React.FC<WebhookTestUtilityProps> = ({
  webhookId,
  webhookUrl,
  onTestComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [testUrl, setTestUrl] = useState(webhookUrl || '');
  const [selectedEvent, setSelectedEvent] = useState('contact.created');
  const [customPayload, setCustomPayload] = useState('');
  const [testResults, setTestResults] = useState<WebhookTestResult[]>([]);
  const [useCustomPayload, setUseCustomPayload] = useState(false);
  const [testHistory, setTestHistory] = useState<any[]>([]);

  const eventTypes = [
    'contact.created',
    'contact.updated',
    'contact.deleted',
    'inventory.created',
    'inventory.updated',
    'inventory.deleted',
    'transaction.created',
    'transaction.updated',
    'transaction.status_changed',
    'user.created',
    'user.updated',
    'user.login',
    'custom.event'
  ];

  const samplePayloads = {
    'contact.created': {
      id: 'contact_123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1-555-0123',
      created_at: new Date().toISOString()
    },
    'contact.updated': {
      id: 'contact_123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      updated_at: new Date().toISOString()
    },
    'inventory.created': {
      id: 'inv_123',
      address: '123 Main St',
      price: 450000,
      bedrooms: 3,
      bathrooms: 2,
      status: 'available',
      created_at: new Date().toISOString()
    },
    'transaction.created': {
      id: 'txn_123',
      contact_id: 'contact_123',
      inventory_id: 'inv_123',
      amount: 450000,
      status: 'pending',
      created_at: new Date().toISOString()
    },
    'user.login': {
      user_id: 'user_123',
      email: 'agent@example.com',
      login_time: new Date().toISOString(),
      ip_address: '192.168.1.1'
    }
  };

  useEffect(() => {
    if (!useCustomPayload) {
      const payload = samplePayloads[selectedEvent as keyof typeof samplePayloads] || {};
      setCustomPayload(JSON.stringify(payload, null, 2));
    }
  }, [selectedEvent, useCustomPayload]);

  useEffect(() => {
    loadTestHistory();
  }, [webhookId]);

  const loadTestHistory = async () => {
    if (!webhookId) return;

    try {
      const response = await fetch(`/api/webhooks/${webhookId}/test-history`);
      if (response.ok) {
        const history = await response.json();
        setTestHistory(history);
      }
    } catch (error) {
      console.error('Failed to load test history:', error);
    }
  };

  const runTest = async () => {
    if (!testUrl.trim()) {
      alert('Please enter a webhook URL');
      return;
    }

    setLoading(true);
    const startTime = Date.now();

    try {
      let payload: any;
      try {
        payload = JSON.parse(customPayload || '{}');
      } catch (e) {
        throw new Error('Invalid JSON payload');
      }

      const testPayload: TestPayload = {
        event: selectedEvent,
        data: payload,
        timestamp: new Date().toISOString()
      };

      const response = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: testUrl,
          payload: testPayload,
          webhookId: webhookId
        })
      });

      const responseTime = Date.now() - startTime;
      const result = await response.json();

      const testResult: WebhookTestResult = {
        success: response.ok,
        statusCode: response.status,
        responseTime,
        requestId: result.requestId,
        responseBody: result.responseBody,
        error: result.error
      };

      setTestResults(prev => [testResult, ...prev]);
      onTestComplete?.(testResult);
      loadTestHistory();

    } catch (error) {
      const testResult: WebhookTestResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      };

      setTestResults(prev => [testResult, ...prev]);
      onTestComplete?.(testResult);
    } finally {
      setLoading(false);
    }
  };

  const runBulkTest = async () => {
    if (!testUrl.trim()) {
      alert('Please enter a webhook URL');
      return;
    }

    setLoading(true);
    const testCount = 5;
    const results: WebhookTestResult[] = [];

    for (let i = 0; i < testCount; i++) {
      const startTime = Date.now();
      
      try {
        const payload = JSON.parse(customPayload || '{}');
        const testPayload: TestPayload = {
          event: selectedEvent,
          data: { ...payload, test_sequence: i + 1 },
          timestamp: new Date().toISOString()
        };

        const response = await fetch('/api/webhooks/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: testUrl,
            payload: testPayload,
            webhookId: webhookId
          })
        });

        const responseTime = Date.now() - startTime;
        const result = await response.json();

        results.push({
          success: response.ok,
          statusCode: response.status,
          responseTime,
          requestId: result.requestId,
          responseBody: result.responseBody,
          error: result.error
        });

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          responseTime: Date.now() - startTime
        });
      }
    }

    setTestResults(prev => [...results, ...prev]);
    setLoading(false);
    loadTestHistory();
  };

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
    } catch {
      return false;
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(testResults, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `webhook-test-results-${new Date().getTime()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className={styles.webhookTestUtility}>
      <div className={styles.testUtilityHeader}>
        <h3>Webhook Test Utility</h3>
        <div className={styles.testUtilityActions}>
          <button 
            onClick={clearResults}
            disabled={testResults.length === 0}
            className={styles.clearBtn}
          >
            Clear Results
          </button>
          <button 
            onClick={exportResults}
            disabled={testResults.length === 0}
            className={styles.exportBtn}
          >
            Export Results
          </button>
        </div>
      </div>

      <div className={styles.testConfiguration}>
        <div className={styles.configRow}>
          <div className={styles.configField}>
            <label>Webhook URL:</label>
            <div className={styles.urlInputContainer}>
              <input
                type="url"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://example.com/webhook"
                className={`${styles.urlInput} ${
                  testUrl && !validateUrl(testUrl) ? styles.invalidUrl : ''
                }`}
              />
              {testUrl && !validateUrl(testUrl) && (
                <span className={styles.urlError}>Invalid URL format</span>
              )}
            </div>
          </div>

          <div className={styles.configField}>
            <label>Event Type:</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className={styles.eventSelect}
            >
              {eventTypes.map(event => (
                <option key={event} value={event}>
                  {event}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.payloadConfiguration}>
          <div className={styles.payloadHeader}>
            <label>Payload:</label>
            <div className={styles.payloadOptions}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={useCustomPayload}
                  onChange={(e) => setUseCustomPayload(e.target.checked)}
                />
                Use custom payload
              </label>
            </div>
          </div>

          <textarea
            value={customPayload}
            onChange={(e) => setCustomPayload(e.target.value)}
            placeholder="Enter JSON payload..."
            className={styles.payloadTextarea}
            rows={10}
            readOnly={!useCustomPayload}
          />
        </div>

        <div className={styles.testActions}>
          <button
            onClick={runTest}
            disabled={loading || !testUrl || !validateUrl(testUrl)}
            className={styles.testBtn}
          >
            {loading ? 'Testing...' : 'Test Webhook'}
          </button>

          <button
            onClick={runBulkTest}
            disabled={loading || !testUrl || !validateUrl(testUrl)}
            className={styles.bulkTestBtn}
          >
            {loading ? 'Testing...' : 'Bulk Test (5x)'}
          </button>
        </div>
      </div>

      {testResults.length > 0 && (
        <div className={styles.testResults}>
          <h4>Test Results</h4>
          <div className={styles.resultsList}>
            {testResults.map((result, index) => (
              <div key={index} className={`${styles.resultItem} ${result.success ? styles.success : styles.failure}`}>
                <div className={styles.resultHeader}>
                  <span className={styles.resultStatus}>
                    {result.success ? '✓' : '✗'} 
                    {result.statusCode && ` ${result.statusCode}`}
                  </span>
                  <span className={styles.resultTime}>
                    {result.responseTime}ms
                  </span>
                  {result.requestId && (
                    <span className={styles.requestId}>
                      ID: {result.requestId}
                    </span>
                  )}
                </div>

                {result.error && (
                  <div className={styles.resultError}>
                    <strong>Error:</strong> {result.error}
                  </div>
                )}

                {result.responseBody && (
                  <div className={styles.resultResponse}>
                    <strong>Response:</strong>
                    <pre>{result.responseBody}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {testHistory.length > 0 && (
        <div className={styles.testHistory}>
          <h4>Recent Test History</h4>
          <div className={styles.historyList}>
            {testHistory.slice(0, 10).map((test, index) => (
              <div key={index} className={`${styles.historyItem} ${test.success ? styles.success : styles.failure}`}>
                <div className={styles.historyHeader}>
                  <span className={styles.historyEvent}>{test.event}</span>
                  <span className={styles.historyStatus}>
                    {test.success ? '✓' : '✗'} {test.status_code}
                  </span>
                  <span className={styles.historyTime}>
                    {new Date(test.created_at).toLocaleString()}
                  </span>
                </div>
                <div className={styles.historyDetails}>
                  <span>Response: {test.response_time}ms</span>
                  {test.error && <span className={styles.historyError}>Error: {test.error}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebhookTestUtility;
