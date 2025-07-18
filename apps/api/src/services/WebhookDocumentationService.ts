import { WebhookEvent, Webhook } from '../entities';
import { AppDataSource } from '../config/database';
import { Repository } from 'typeorm';

export interface WebhookDocumentation {
  webhook: any;
  events: WebhookEventDoc[];
  authentication: AuthenticationDoc;
  examples: CodeExamples;
  testing: TestingInfo;
  troubleshooting: TroubleshootingInfo;
}

export interface WebhookEventDoc {
  eventType: string;
  description: string;
  samplePayload: any;
  headers: HeaderDoc[];
  frequency: string;
  retryPolicy: RetryPolicyDoc;
}

export interface AuthenticationDoc {
  signatureHeader: string;
  algorithm: string;
  verificationExamples: CodeExamples;
  secretRotation: SecretRotationDoc;
}

export interface CodeExamples {
  nodejs: string;
  python: string;
  php: string;
  curl: string;
  javascript: string;
  ruby: string;
}

export interface HeaderDoc {
  name: string;
  description: string;
  required: boolean;
  example: string;
}

export interface RetryPolicyDoc {
  maxAttempts: number;
  backoffStrategy: string;
  retryDelays: number[];
  failureThreshold: number;
}

export interface SecretRotationDoc {
  gracePeriod: string;
  notificationMethods: string[];
  rotationFrequency: string;
}

export interface TestingInfo {
  testEndpoint: string;
  testEvents: string[];
  debugHeaders: string[];
  responseValidation: string[];
}

export interface TroubleshootingInfo {
  commonErrors: CommonError[];
  diagnosticSteps: string[];
  supportContact: string;
}

export interface CommonError {
  errorCode: string;
  description: string;
  solution: string;
  preventionTips: string[];
}

export class WebhookDocumentationService {
  private webhookRepository: Repository<Webhook>;
  private webhookEventRepository: Repository<WebhookEvent>;

  constructor() {
    this.webhookRepository = AppDataSource.getRepository(Webhook);
    this.webhookEventRepository = AppDataSource.getRepository(WebhookEvent);
  }

  /**
   * Generate comprehensive documentation for a webhook
   */
  async generateWebhookDocumentation(webhookId: string): Promise<WebhookDocumentation> {
    const webhook = await this.webhookRepository.findOne({
      where: { id: webhookId },
      relations: ['workspace']
    });

    if (!webhook) {
      throw new Error('Webhook not found');
    }

    const events = await this.getEventDocumentation(webhook.events);
    const authentication = this.getAuthenticationDocumentation(webhook.secret);
    const examples = this.generateCodeExamples(webhook);
    const testing = this.getTestingInformation(webhook);
    const troubleshooting = this.getTroubleshootingInformation();

    return {
      webhook: {
        id: webhook.id,
        name: webhook.name,
        url: webhook.url,
        description: webhook.description,
        events: webhook.events,
        isActive: webhook.isActive,
        createdAt: webhook.createdAt,
        updatedAt: webhook.updatedAt
      },
      events,
      authentication,
      examples,
      testing,
      troubleshooting
    };
  }

  /**
   * Get event documentation
   */
  private async getEventDocumentation(subscribedEvents: string[]): Promise<WebhookEventDoc[]> {
    const events = await this.webhookEventRepository.find({
      where: { 
        eventType: subscribedEvents.length > 0 ? subscribedEvents : undefined,
        isActive: true 
      }
    });

    return events.map(event => ({
      eventType: event.eventType,
      description: event.description || 'No description available',
      samplePayload: event.samplePayload,
      headers: this.getEventHeaders(),
      frequency: this.getEventFrequency(event.eventType),
      retryPolicy: this.getRetryPolicy()
    }));
  }

  /**
   * Get authentication documentation
   */
  private getAuthenticationDocumentation(secret: string): AuthenticationDoc {
    return {
      signatureHeader: 'X-Webhook-Signature',
      algorithm: 'HMAC-SHA256',
      verificationExamples: this.generateSignatureVerificationExamples(secret),
      secretRotation: {
        gracePeriod: '24 hours',
        notificationMethods: ['Email', 'Dashboard notification'],
        rotationFrequency: 'As needed (recommended: every 90 days)'
      }
    };
  }

  /**
   * Generate code examples
   */
  private generateCodeExamples(webhook: Webhook): CodeExamples {
    return {
      nodejs: this.generateNodeJSExample(webhook),
      python: this.generatePythonExample(webhook),
      php: this.generatePHPExample(webhook),
      curl: this.generateCurlExample(webhook),
      javascript: this.generateJavaScriptExample(webhook),
      ruby: this.generateRubyExample(webhook)
    };
  }

  /**
   * Generate Node.js example
   */
  private generateNodeJSExample(webhook: Webhook): string {
    return `
const express = require('express');
const crypto = require('crypto');
const app = express();

// Middleware to verify webhook signature
function verifyWebhookSignature(req, res, next) {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  const secret = '${webhook.secret}';
  
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const calculatedSignature = 'sha256=' + hmac.digest('hex');
  
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(calculatedSignature))) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  next();
}

// Webhook endpoint
app.post('/webhook', express.json(), verifyWebhookSignature, (req, res) => {
  const { event, data, timestamp } = req.body;
  
  console.log('Received webhook:', event);
  console.log('Data:', data);
  console.log('Timestamp:', timestamp);
  
  // Process the webhook event
  switch (event) {
    case 'contact.created':
      handleContactCreated(data);
      break;
    case 'contact.updated':
      handleContactUpdated(data);
      break;
    case 'transaction.created':
      handleTransactionCreated(data);
      break;
    default:
      console.log('Unknown event type:', event);
  }
  
  // Always respond with 200 OK
  res.json({ received: true });
});

function handleContactCreated(data) {
  // Your contact creation logic here
  console.log('New contact created:', data.id);
}

function handleContactUpdated(data) {
  // Your contact update logic here
  console.log('Contact updated:', data.id);
}

function handleTransactionCreated(data) {
  // Your transaction creation logic here
  console.log('New transaction created:', data.id);
}

app.listen(3000, () => {
  console.log('Webhook server listening on port 3000');
});
`;
  }

  /**
   * Generate Python example
   */
  private generatePythonExample(webhook: Webhook): string {
    return `
import hashlib
import hmac
import json
from flask import Flask, request, jsonify

app = Flask(__name__)

WEBHOOK_SECRET = '${webhook.secret}'

def verify_webhook_signature(payload, signature):
    """Verify the webhook signature"""
    calculated_signature = 'sha256=' + hmac.new(
        WEBHOOK_SECRET.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, calculated_signature)

@app.route('/webhook', methods=['POST'])
def webhook():
    # Get the signature from headers
    signature = request.headers.get('X-Webhook-Signature')
    if not signature:
        return jsonify({'error': 'Missing signature'}), 401
    
    # Get the raw payload
    payload = request.get_data(as_text=True)
    
    # Verify the signature
    if not verify_webhook_signature(payload, signature):
        return jsonify({'error': 'Invalid signature'}), 401
    
    # Parse the JSON payload
    try:
        data = json.loads(payload)
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid JSON'}), 400
    
    # Process the webhook event
    event_type = data.get('event')
    event_data = data.get('data')
    
    print(f"Received webhook: {event_type}")
    print(f"Data: {event_data}")
    
    # Handle different event types
    if event_type == 'contact.created':
        handle_contact_created(event_data)
    elif event_type == 'contact.updated':
        handle_contact_updated(event_data)
    elif event_type == 'transaction.created':
        handle_transaction_created(event_data)
    else:
        print(f"Unknown event type: {event_type}")
    
    return jsonify({'received': True})

def handle_contact_created(data):
    """Handle contact creation event"""
    print(f"New contact created: {data.get('id')}")
    # Your contact creation logic here

def handle_contact_updated(data):
    """Handle contact update event"""
    print(f"Contact updated: {data.get('id')}")
    # Your contact update logic here

def handle_transaction_created(data):
    """Handle transaction creation event"""
    print(f"New transaction created: {data.get('id')}")
    # Your transaction creation logic here

if __name__ == '__main__':
    app.run(debug=True, port=3000)
`;
  }

  /**
   * Generate PHP example
   */
  private generatePHPExample(webhook: Webhook): string {
    return `
<?php
define('WEBHOOK_SECRET', '${webhook.secret}');

function verifyWebhookSignature($payload, $signature) {
    $calculatedSignature = 'sha256=' . hash_hmac('sha256', $payload, WEBHOOK_SECRET);
    return hash_equals($signature, $calculatedSignature);
}

function handleContactCreated($data) {
    error_log('New contact created: ' . $data['id']);
    // Your contact creation logic here
}

function handleContactUpdated($data) {
    error_log('Contact updated: ' . $data['id']);
    // Your contact update logic here
}

function handleTransactionCreated($data) {
    error_log('New transaction created: ' . $data['id']);
    // Your transaction creation logic here
}

// Main webhook handler
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the signature from headers
    $signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? '';
    
    if (empty($signature)) {
        http_response_code(401);
        echo json_encode(['error' => 'Missing signature']);
        exit;
    }
    
    // Get the raw payload
    $payload = file_get_contents('php://input');
    
    // Verify the signature
    if (!verifyWebhookSignature($payload, $signature)) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid signature']);
        exit;
    }
    
    // Parse the JSON payload
    $data = json_decode($payload, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }
    
    // Process the webhook event
    $eventType = $data['event'] ?? '';
    $eventData = $data['data'] ?? [];
    
    error_log('Received webhook: ' . $eventType);
    
    switch ($eventType) {
        case 'contact.created':
            handleContactCreated($eventData);
            break;
        case 'contact.updated':
            handleContactUpdated($eventData);
            break;
        case 'transaction.created':
            handleTransactionCreated($eventData);
            break;
        default:
            error_log('Unknown event type: ' . $eventType);
    }
    
    // Always respond with 200 OK
    http_response_code(200);
    echo json_encode(['received' => true]);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
`;
  }

  /**
   * Generate cURL example
   */
  private generateCurlExample(webhook: Webhook): string {
    return `
# Test webhook endpoint
curl -X POST ${webhook.url} \\
  -H "Content-Type: application/json" \\
  -H "X-Webhook-Signature: sha256=..." \\
  -d '{
    "event": "contact.created",
    "data": {
      "id": "contact_123",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com"
    },
    "timestamp": "2024-01-15T10:00:00Z",
    "workspace_id": "workspace_123"
  }'

# Test webhook with authentication
SECRET="${webhook.secret}"
PAYLOAD='{"event":"webhook.test","message":"Test message"}'
SIGNATURE="sha256="$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" -binary | base64)

curl -X POST ${webhook.url} \\
  -H "Content-Type: application/json" \\
  -H "X-Webhook-Signature: $SIGNATURE" \\
  -d "$PAYLOAD"
`;
  }

  /**
   * Generate JavaScript example
   */
  private generateJavaScriptExample(webhook: Webhook): string {
    return `
// Frontend webhook handler (for testing purposes)
async function handleWebhook(webhookData) {
    const { event, data, timestamp } = webhookData;
    
    console.log('Received webhook:', event);
    console.log('Data:', data);
    console.log('Timestamp:', timestamp);
    
    // Process different event types
    switch (event) {
        case 'contact.created':
            await handleContactCreated(data);
            break;
        case 'contact.updated':
            await handleContactUpdated(data);
            break;
        case 'transaction.created':
            await handleTransactionCreated(data);
            break;
        default:
            console.log('Unknown event type:', event);
    }
}

async function handleContactCreated(data) {
    console.log('New contact created:', data.id);
    // Update your UI or trigger notifications
    updateContactsList(data);
}

async function handleContactUpdated(data) {
    console.log('Contact updated:', data.id);
    // Update existing contact in UI
    updateContactInList(data);
}

async function handleTransactionCreated(data) {
    console.log('New transaction created:', data.id);
    // Update transactions dashboard
    updateTransactionsDashboard(data);
}

// WebSocket connection for real-time updates
const ws = new WebSocket('ws://your-app.com/webhook-stream');
ws.onmessage = (event) => {
    const webhookData = JSON.parse(event.data);
    handleWebhook(webhookData);
};

// Server-sent events alternative
const eventSource = new EventSource('/webhook-stream');
eventSource.onmessage = (event) => {
    const webhookData = JSON.parse(event.data);
    handleWebhook(webhookData);
};
`;
  }

  /**
   * Generate Ruby example
   */
  private generateRubyExample(webhook: Webhook): string {
    return `
require 'sinatra'
require 'json'
require 'openssl'

WEBHOOK_SECRET = '${webhook.secret}'

def verify_webhook_signature(payload, signature)
  calculated_signature = 'sha256=' + OpenSSL::HMAC.hexdigest('sha256', WEBHOOK_SECRET, payload)
  Rack::Utils.secure_compare(signature, calculated_signature)
end

def handle_contact_created(data)
  puts "New contact created: #{data['id']}"
  # Your contact creation logic here
end

def handle_contact_updated(data)
  puts "Contact updated: #{data['id']}"
  # Your contact update logic here
end

def handle_transaction_created(data)
  puts "New transaction created: #{data['id']}"
  # Your transaction creation logic here
end

post '/webhook' do
  # Get the signature from headers
  signature = request.env['HTTP_X_WEBHOOK_SIGNATURE']
  
  if signature.nil? || signature.empty?
    status 401
    return { error: 'Missing signature' }.to_json
  end
  
  # Get the raw payload
  payload = request.body.read
  
  # Verify the signature
  unless verify_webhook_signature(payload, signature)
    status 401
    return { error: 'Invalid signature' }.to_json
  end
  
  # Parse the JSON payload
  begin
    data = JSON.parse(payload)
  rescue JSON::ParserError
    status 400
    return { error: 'Invalid JSON' }.to_json
  end
  
  # Process the webhook event
  event_type = data['event']
  event_data = data['data']
  
  puts "Received webhook: #{event_type}"
  puts "Data: #{event_data}"
  
  case event_type
  when 'contact.created'
    handle_contact_created(event_data)
  when 'contact.updated'
    handle_contact_updated(event_data)
  when 'transaction.created'
    handle_transaction_created(event_data)
  else
    puts "Unknown event type: #{event_type}"
  end
  
  # Always respond with 200 OK
  status 200
  { received: true }.to_json
end
`;
  }

  /**
   * Generate signature verification examples
   */
  private generateSignatureVerificationExamples(secret: string): CodeExamples {
    return {
      nodejs: `
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const calculatedSignature = 'sha256=' + hmac.digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(calculatedSignature));
}
      `,
      python: `
import hashlib
import hmac

def verify_signature(payload, signature, secret):
    calculated_signature = 'sha256=' + hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(signature, calculated_signature)
      `,
      php: `
function verifySignature($payload, $signature, $secret) {
    $calculatedSignature = 'sha256=' . hash_hmac('sha256', $payload, $secret);
    return hash_equals($signature, $calculatedSignature);
}
      `,
      curl: `
# Generate signature in bash
SECRET="${secret}"
PAYLOAD='{"event":"test"}'
SIGNATURE="sha256="$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" -binary | base64)
      `,
      javascript: `
async function verifySignature(payload, signature, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const calculatedSignature = 'sha256=' + Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  return signature === calculatedSignature;
}
      `,
      ruby: `
require 'openssl'

def verify_signature(payload, signature, secret)
  calculated_signature = 'sha256=' + OpenSSL::HMAC.hexdigest('sha256', secret, payload)
  Rack::Utils.secure_compare(signature, calculated_signature)
end
      `
    };
  }

  /**
   * Get event headers documentation
   */
  private getEventHeaders(): HeaderDoc[] {
    return [
      {
        name: 'X-Webhook-Signature',
        description: 'HMAC-SHA256 signature of the request body',
        required: true,
        example: 'sha256=a1b2c3d4e5f6...'
      },
      {
        name: 'Content-Type',
        description: 'Content type of the request',
        required: true,
        example: 'application/json'
      },
      {
        name: 'X-Webhook-Event',
        description: 'The event type that triggered this webhook',
        required: true,
        example: 'contact.created'
      },
      {
        name: 'X-Webhook-ID',
        description: 'Unique identifier for this webhook delivery',
        required: true,
        example: 'webhook_1234567890'
      },
      {
        name: 'X-Webhook-Timestamp',
        description: 'Timestamp when the webhook was sent',
        required: true,
        example: '2024-01-15T10:00:00Z'
      },
      {
        name: 'User-Agent',
        description: 'User agent of the webhook sender',
        required: false,
        example: 'OpenHouseCRM-Webhooks/1.0'
      }
    ];
  }

  /**
   * Get event frequency information
   */
  private getEventFrequency(eventType: string): string {
    const frequencies: { [key: string]: string } = {
      'contact.created': 'Variable - depends on contact creation rate',
      'contact.updated': 'High - contacts are frequently updated',
      'contact.deleted': 'Low - contacts are rarely deleted',
      'transaction.created': 'Medium - depends on business activity',
      'transaction.updated': 'High - transactions are frequently updated',
      'transaction.deleted': 'Low - transactions are rarely deleted',
      'property.created': 'Low - new properties added occasionally',
      'property.updated': 'Medium - property details updated regularly',
      'property.deleted': 'Very Low - properties rarely deleted',
      'webhook.test': 'Manual - only when testing'
    };

    return frequencies[eventType] || 'Unknown';
  }

  /**
   * Get retry policy documentation
   */
  private getRetryPolicy(): RetryPolicyDoc {
    return {
      maxAttempts: 3,
      backoffStrategy: 'Exponential backoff',
      retryDelays: [1000, 5000, 15000], // 1s, 5s, 15s
      failureThreshold: 10
    };
  }

  /**
   * Get testing information
   */
  private getTestingInformation(webhook: Webhook): TestingInfo {
    return {
      testEndpoint: `/api/webhooks/${webhook.id}/test`,
      testEvents: ['webhook.test', 'contact.created', 'transaction.created'],
      debugHeaders: [
        'X-Webhook-Signature',
        'X-Webhook-Event',
        'X-Webhook-ID',
        'X-Webhook-Timestamp'
      ],
      responseValidation: [
        'Must respond with HTTP 200-299',
        'Response time should be under 10 seconds',
        'Content-Type should be application/json (optional)',
        'Response body can be empty or contain acknowledgment'
      ]
    };
  }

  /**
   * Get troubleshooting information
   */
  private getTroubleshootingInformation(): TroubleshootingInfo {
    return {
      commonErrors: [
        {
          errorCode: '401',
          description: 'Unauthorized - Invalid signature',
          solution: 'Verify that you are using the correct webhook secret and signature algorithm',
          preventionTips: [
            'Always use the latest webhook secret',
            'Ensure signature is calculated correctly',
            'Check for secret rotation'
          ]
        },
        {
          errorCode: '404',
          description: 'Endpoint not found',
          solution: 'Verify that your webhook URL is correct and accessible',
          preventionTips: [
            'Test your endpoint before registering',
            'Use HTTPS URLs',
            'Ensure endpoint is publicly accessible'
          ]
        },
        {
          errorCode: '500',
          description: 'Internal server error',
          solution: 'Check your webhook endpoint logs for errors',
          preventionTips: [
            'Add proper error handling',
            'Log all webhook requests',
            'Monitor endpoint health'
          ]
        },
        {
          errorCode: 'TIMEOUT',
          description: 'Request timeout',
          solution: 'Optimize your webhook endpoint to respond faster',
          preventionTips: [
            'Keep processing under 10 seconds',
            'Use asynchronous processing',
            'Return 200 immediately, process later'
          ]
        }
      ],
      diagnosticSteps: [
        'Check webhook endpoint accessibility',
        'Verify signature calculation',
        'Test with webhook testing tool',
        'Check endpoint logs',
        'Monitor webhook delivery logs',
        'Verify SSL certificate'
      ],
      supportContact: 'support@openhouse-crm.com'
    };
  }

  /**
   * Generate OpenAPI specification
   */
  async generateOpenAPISpec(webhookId: string): Promise<any> {
    const webhook = await this.webhookRepository.findOne({
      where: { id: webhookId }
    });

    if (!webhook) {
      throw new Error('Webhook not found');
    }

    const events = await this.webhookEventRepository.find({
      where: { eventType: webhook.events }
    });

    return {
      openapi: '3.0.0',
      info: {
        title: `${webhook.name} Webhook API`,
        version: '1.0.0',
        description: webhook.description,
        contact: {
          name: 'OpenHouse CRM Support',
          email: 'support@openhouse-crm.com'
        }
      },
      servers: [
        {
          url: webhook.url,
          description: 'Webhook endpoint'
        }
      ],
      paths: {
        '/': {
          post: {
            summary: 'Webhook endpoint',
            description: 'Receives webhook events from OpenHouse CRM',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      event: {
                        type: 'string',
                        enum: webhook.events
                      },
                      data: {
                        type: 'object'
                      },
                      timestamp: {
                        type: 'string',
                        format: 'date-time'
                      },
                      workspace_id: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Webhook received successfully'
              },
              '401': {
                description: 'Invalid signature'
              },
              '500': {
                description: 'Internal server error'
              }
            },
            security: [
              {
                webhook_signature: []
              }
            ]
          }
        }
      },
      components: {
        securitySchemes: {
          webhook_signature: {
            type: 'apiKey',
            in: 'header',
            name: 'X-Webhook-Signature',
            description: 'HMAC-SHA256 signature of the request body'
          }
        }
      }
    };
  }
}
