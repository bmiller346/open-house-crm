import swaggerJSDoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Open House CRM API',
    version: '1.0.0',
    description: 'A comprehensive real estate CRM platform API with multi-tenant workspace support',
    contact: {
      name: 'API Support',
      email: 'support@openhousecrm.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: process.env.API_BASE_URL || 'http://localhost:3001',
      description: 'Development server',
    },
    {
      url: 'https://api.openhousecrm.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from /auth/login',
      },
    },
    parameters: {
      workspaceId: {
        name: 'x-workspace-id',
        in: 'header',
        required: true,
        description: 'The workspace ID for tenant isolation',
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'string',
            example: 'Error message',
          },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          firstName: {
            type: 'string',
            example: 'John',
          },
          lastName: {
            type: 'string',
            example: 'Doe',
          },
          phone: {
            type: 'string',
            example: '+1-555-123-4567',
          },
          avatar: {
            type: 'string',
            example: 'https://example.com/avatar.jpg',
          },
          isEmailVerified: {
            type: 'boolean',
            example: true,
          },
          lastLoginAt: {
            type: 'string',
            format: 'date-time',
          },
          preferences: {
            type: 'object',
            properties: {
              theme: {
                type: 'string',
                enum: ['light', 'dark', 'auto'],
                example: 'light',
              },
              notifications: {
                type: 'object',
                properties: {
                  email: { type: 'boolean', example: true },
                  push: { type: 'boolean', example: true },
                  sms: { type: 'boolean', example: false },
                },
              },
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Workspace: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          name: {
            type: 'string',
            example: 'Acme Real Estate',
          },
          slug: {
            type: 'string',
            example: 'acme-real-estate-123456',
          },
          ownerId: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          subscriptionPlan: {
            type: 'string',
            enum: ['free', 'pro', 'enterprise'],
            example: 'pro',
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
          settings: {
            type: 'object',
            example: {
              branding: { primaryColor: '#007bff', logo: 'https://example.com/logo.png' },
              features: { enableAI: true, enableAnalytics: true },
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Contact: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          workspaceId: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          name: {
            type: 'string',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          phone: {
            type: 'string',
            example: '+1-555-123-4567',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Pipeline: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          workspaceId: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          name: {
            type: 'string',
            example: 'Sales Pipeline',
          },
          stages: {
            type: 'array',
            items: {
              type: 'string',
            },
            example: ['lead', 'qualified', 'proposal', 'negotiation', 'closed'],
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Transaction: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          workspaceId: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          contactId: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          pipelineStage: {
            type: 'string',
            example: 'qualified',
          },
          amount: {
            type: 'number',
            format: 'decimal',
            example: 250000.00,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Property: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          workspaceId: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          address: {
            type: 'string',
            example: '123 Main St, Anytown, CA 90210',
          },
          value: {
            type: 'number',
            format: 'decimal',
            example: 750000.00,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            example: 'password123',
          },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            properties: {
              user: {
                $ref: '#/components/schemas/User',
              },
              accessToken: {
                type: 'string',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
            },
          },
        },
      },
      CreateWorkspaceRequest: {
        type: 'object',
        required: ['name', 'slug'],
        properties: {
          name: {
            type: 'string',
            example: 'Acme Real Estate',
          },
          slug: {
            type: 'string',
            example: 'acme-real-estate',
          },
        },
      },
      CreateContactRequest: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: {
            type: 'string',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          phone: {
            type: 'string',
            example: '+1-555-123-4567',
          },
        },
      },
      CreateTransactionRequest: {
        type: 'object',
        required: ['contactId', 'pipelineStage', 'amount'],
        properties: {
          contactId: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          pipelineStage: {
            type: 'string',
            example: 'qualified',
          },
          amount: {
            type: 'number',
            format: 'decimal',
            example: 250000.00,
          },
        },
      },
      CreatePropertyRequest: {
        type: 'object',
        required: ['address', 'value'],
        properties: {
          address: {
            type: 'string',
            example: '123 Main St, Anytown, CA 90210',
          },
          value: {
            type: 'number',
            format: 'decimal',
            example: 750000.00,
          },
        },
      },
      LeadScore: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          workspaceId: { type: 'string', format: 'uuid' },
          contactId: { type: 'string', format: 'uuid' },
          score: { 
            type: 'number', 
            minimum: 0, 
            maximum: 100,
            description: 'Overall lead score (0-100)'
          },
          category: { 
            type: 'string', 
            enum: ['hot', 'warm', 'cold', 'qualified', 'unqualified'],
            description: 'Lead category based on score'
          },
          confidence: { 
            type: 'number', 
            minimum: 0, 
            maximum: 100,
            description: 'Confidence level of the score (0-100)'
          },
          factors: {
            type: 'object',
            properties: {
              demographic: { type: 'number', minimum: 0, maximum: 100 },
              behavioral: { type: 'number', minimum: 0, maximum: 100 },
              engagement: { type: 'number', minimum: 0, maximum: 100 },
              financial: { type: 'number', minimum: 0, maximum: 100 },
              timing: { type: 'number', minimum: 0, maximum: 100 },
              intent: { type: 'number', minimum: 0, maximum: 100 }
            },
            description: 'Individual scoring factors contributing to overall score'
          },
          insights: {
            type: 'object',
            properties: {
              strengths: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Key strengths of this lead'
              },
              weaknesses: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Areas for improvement'
              },
              recommendations: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Recommended actions for this lead'
              },
              nextBestAction: { 
                type: 'string',
                description: 'The single best next action to take'
              },
              estimatedCloseTime: { 
                type: 'number',
                description: 'Estimated days to close'
              },
              estimatedValue: { 
                type: 'number',
                description: 'Estimated transaction value'
              }
            },
            description: 'AI-generated insights and recommendations'
          },
          metadata: {
            type: 'object',
            properties: {
              modelVersion: { type: 'string', description: 'Version of scoring model used' },
              computedAt: { type: 'string', format: 'date-time' },
              dataPoints: { type: 'number', description: 'Number of data points used' },
              lastActivityDate: { type: 'string', format: 'date-time' },
              sourceChannels: { type: 'array', items: { type: 'string' } }
            }
          },
          contact: { $ref: '#/components/schemas/Contact' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'workspaceId', 'contactId', 'score', 'category', 'confidence', 'factors', 'insights']
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/features/*/controller.ts', './src/server.ts'],
};

export const specs = swaggerJSDoc(options);
