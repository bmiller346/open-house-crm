import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { WEBHOOK_EVENTS } from '../../../../packages/core/src/types';

/**
 * Validation middleware for webhook configuration
 */
export const validateWebhookConfig = [
  body('url')
    .isURL()
    .withMessage('URL must be a valid URL')
    .custom((value) => {
      // Only allow HTTPS URLs in production
      if (process.env.NODE_ENV === 'production' && !value.startsWith('https://')) {
        throw new Error('URL must use HTTPS in production');
      }
      return true;
    }),
  
  body('events')
    .isArray({ min: 1 })
    .withMessage('Events must be an array with at least one event')
    .custom((events) => {
      const validEvents = Object.values(WEBHOOK_EVENTS);
      const invalidEvents = events.filter((event: string) => !validEvents.includes(event));
      
      if (invalidEvents.length > 0) {
        throw new Error(`Invalid events: ${invalidEvents.join(', ')}`);
      }
      return true;
    }),
  
  body('secret')
    .optional()
    .isString()
    .isLength({ min: 8 })
    .withMessage('Secret must be at least 8 characters long'),
  
  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Validation middleware for webhook updates
 */
export const validateWebhookUpdate = [
  body('url')
    .optional()
    .isURL()
    .withMessage('URL must be a valid URL')
    .custom((value) => {
      // Only allow HTTPS URLs in production
      if (process.env.NODE_ENV === 'production' && !value.startsWith('https://')) {
        throw new Error('URL must use HTTPS in production');
      }
      return true;
    }),
  
  body('events')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Events must be an array with at least one event')
    .custom((events) => {
      const validEvents = Object.values(WEBHOOK_EVENTS);
      const invalidEvents = events.filter((event: string) => !validEvents.includes(event));
      
      if (invalidEvents.length > 0) {
        throw new Error(`Invalid events: ${invalidEvents.join(', ')}`);
      }
      return true;
    }),
  
  body('secret')
    .optional()
    .isString()
    .isLength({ min: 8 })
    .withMessage('Secret must be at least 8 characters long'),
  
  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Validation middleware for webhook event types
 */
export const validateWebhookEventType = [
  body('eventType')
    .isString()
    .withMessage('Event type must be a string')
    .custom((eventType) => {
      const validEvents = Object.values(WEBHOOK_EVENTS);
      if (!validEvents.includes(eventType)) {
        throw new Error(`Invalid event type: ${eventType}`);
      }
      return true;
    }),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];
