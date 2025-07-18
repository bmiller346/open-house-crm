import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { User } from '../../entities/User';
import { Workspace } from '../../entities/Workspace';

export interface NotificationSettings {
  email: {
    enabled: boolean;
    frequency: 'instant' | 'daily' | 'weekly' | 'disabled';
    types: {
      newLeads: boolean;
      appointmentReminders: boolean;
      taskDeadlines: boolean;
      systemUpdates: boolean;
      marketingEmails: boolean;
      securityAlerts: boolean;
    };
  };
  push: {
    enabled: boolean;
    types: {
      newLeads: boolean;
      appointmentReminders: boolean;
      taskDeadlines: boolean;
      mentions: boolean;
      systemAlerts: boolean;
    };
  };
  sms: {
    enabled: boolean;
    phoneNumber?: string;
    types: {
      urgentAlerts: boolean;
      appointmentReminders: boolean;
      securityAlerts: boolean;
    };
  };
  inApp: {
    enabled: boolean;
    showBadges: boolean;
    playSound: boolean;
    types: {
      newLeads: boolean;
      taskUpdates: boolean;
      mentions: boolean;
      systemNotifications: boolean;
    };
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    timezone: string;
  };
  workspaceOverrides: Record<string, Partial<NotificationSettings>>;
}

/**
 * @swagger
 * /api/settings/notifications:
 *   get:
 *     summary: Get notification settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: object
 *                     push:
 *                       type: object
 *                     sms:
 *                       type: object
 *                     inApp:
 *                       type: object
 *                     quietHours:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getNotificationSettings = async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: (req as any).user.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get notification settings from user preferences or return defaults
    const notificationSettings: NotificationSettings = (user.preferences as any)?.notifications || {
      email: {
        enabled: true,
        frequency: 'instant',
        types: {
          newLeads: true,
          appointmentReminders: true,
          taskDeadlines: true,
          systemUpdates: true,
          marketingEmails: false,
          securityAlerts: true
        }
      },
      push: {
        enabled: true,
        types: {
          newLeads: true,
          appointmentReminders: true,
          taskDeadlines: true,
          mentions: true,
          systemAlerts: true
        }
      },
      sms: {
        enabled: false,
        phoneNumber: user.phone || undefined,
        types: {
          urgentAlerts: true,
          appointmentReminders: false,
          securityAlerts: true
        }
      },
      inApp: {
        enabled: true,
        showBadges: true,
        playSound: true,
        types: {
          newLeads: true,
          taskUpdates: true,
          mentions: true,
          systemNotifications: true
        }
      },
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
        timezone: 'UTC'
      },
      workspaceOverrides: {}
    };

    res.json({
      success: true,
      data: notificationSettings
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification settings'
    });
  }
};

/**
 * @swagger
 * /api/settings/notifications:
 *   put:
 *     summary: Update notification settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: object
 *               push:
 *                 type: object
 *               sms:
 *                 type: object
 *               inApp:
 *                 type: object
 *               quietHours:
 *                 type: object
 *               workspaceOverrides:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notification settings updated successfully
 *       400:
 *         description: Invalid settings data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const updateNotificationSettings = async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: (req as any).user.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { email, push, sms, inApp, quietHours, workspaceOverrides } = req.body;

    // Get current preferences
    const currentPreferences = user.preferences || {};
    const currentNotifications = (currentPreferences as any).notifications || {};

    // Update notification settings
    const updatedNotifications = {
      ...currentNotifications,
      ...(email && { email }),
      ...(push && { push }),
      ...(sms && { sms }),
      ...(inApp && { inApp }),
      ...(quietHours && { quietHours }),
      ...(workspaceOverrides && { workspaceOverrides })
    };

    // Update user preferences
    const updatedPreferences = {
      ...currentPreferences,
      notifications: updatedNotifications
    };

    await userRepository.update(user.id, {
      preferences: updatedPreferences
    });

    res.json({
      success: true,
      data: updatedNotifications,
      message: 'Notification settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update notification settings'
    });
  }
};

/**
 * @swagger
 * /api/settings/notifications/test:
 *   post:
 *     summary: Test notification delivery
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [email, push, sms, inApp]
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Test notification sent successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const testNotification = async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: (req as any).user.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { type, message } = req.body;

    if (!type || !['email', 'push', 'sms', 'inApp'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid notification type'
      });
    }

    const testMessage = message || 'This is a test notification from Open House CRM';

    // Simulate sending notification based on type
    let result = { success: true, message: '' };

    switch (type) {
      case 'email':
        // TODO: Implement email notification test
        result.message = `Test email sent to ${user.email}`;
        break;
      case 'push':
        // TODO: Implement push notification test
        result.message = 'Test push notification sent';
        break;
      case 'sms':
        // TODO: Implement SMS notification test
        const phoneNumber = user.phone || 'No phone number configured';
        result.message = `Test SMS would be sent to ${phoneNumber}`;
        break;
      case 'inApp':
        // TODO: Implement in-app notification test
        result.message = 'Test in-app notification sent';
        break;
    }

    res.json({
      success: true,
      data: result,
      message: 'Test notification processed successfully'
    });
  } catch (error) {
    console.error('Error testing notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test notification'
    });
  }
};

/**
 * @swagger
 * /api/settings/notifications/unsubscribe:
 *   post:
 *     summary: Unsubscribe from notification type
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [email, push, sms, inApp]
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Unsubscribed successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const unsubscribeFromNotifications = async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: (req as any).user.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const { type, category } = req.body;

    if (!type || !['email', 'push', 'sms', 'inApp'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid notification type'
      });
    }

    // Get current preferences
    const currentPreferences = user.preferences || {};
    const currentNotifications = (currentPreferences as any).notifications || {};

    // Update the specific notification type
    if (category && currentNotifications[type] && currentNotifications[type].types) {
      currentNotifications[type].types[category] = false;
    } else {
      // Disable the entire type if no specific category
      if (currentNotifications[type]) {
        currentNotifications[type].enabled = false;
      }
    }

    const updatedPreferences = {
      ...currentPreferences,
      notifications: currentNotifications
    };

    await userRepository.update(user.id, {
      preferences: updatedPreferences
    });

    res.json({
      success: true,
      message: category 
        ? `Unsubscribed from ${category} ${type} notifications`
        : `Unsubscribed from all ${type} notifications`
    });
  } catch (error) {
    console.error('Error unsubscribing from notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unsubscribe from notifications'
    });
  }
};

/**
 * @swagger
 * /api/settings/notifications/digest:
 *   get:
 *     summary: Get notification digest settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification digest settings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getNotificationDigest = async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: (req as any).user.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const digestSettings = {
      enabled: true,
      frequency: 'daily', // daily, weekly, monthly
      time: '09:00',
      timezone: 'UTC',
      includeMetrics: true,
      includeUpcomingTasks: true,
      includeRecentActivity: true,
      includeLeadSummary: true
    };

    res.json({
      success: true,
      data: digestSettings
    });
  } catch (error) {
    console.error('Error fetching notification digest settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification digest settings'
    });
  }
};
