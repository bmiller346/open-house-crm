import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { User } from '../../entities/User';
import { Workspace } from '../../entities/Workspace';

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    leadAlerts?: boolean;
    taskReminders?: boolean;
    appointmentReminders?: boolean;
  };
  dashboard?: {
    defaultView?: 'grid' | 'list' | 'calendar';
    showQuickActions?: boolean;
    defaultDateRange?: '7d' | '30d' | '90d' | '1y';
    refreshInterval?: number;
  };
  privacy?: {
    showOnlineStatus?: boolean;
    allowDataCollection?: boolean;
    shareAnalytics?: boolean;
  };
  accessibility?: {
    fontSize?: 'small' | 'medium' | 'large';
    highContrast?: boolean;
    reduceMotion?: boolean;
  };
}

export interface WorkspaceSettings {
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    companyName?: string;
  };
  features?: {
    enablePropertyData?: boolean;
    enableInventory?: boolean;
    enableTransactions?: boolean;
    enableCalendar?: boolean;
    enableWebhooks?: boolean;
    enableAI?: boolean;
  };
  security?: {
    requireMFA?: boolean;
    passwordPolicy?: {
      minLength?: number;
      requireUppercase?: boolean;
      requireNumbers?: boolean;
      requireSymbols?: boolean;
    };
    sessionTimeout?: number;
    allowedDomains?: string[];
  };
  integrations?: {
    email?: {
      provider?: 'smtp' | 'sendgrid' | 'mailgun';
      settings?: any;
    };
    sms?: {
      provider?: 'twilio' | 'nexmo';
      settings?: any;
    };
    calendar?: {
      provider?: 'google' | 'outlook' | 'office365';
      settings?: any;
    };
  };
}

/**
 * @swagger
 * /api/settings/preferences:
 *   get:
 *     summary: Get user preferences
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences retrieved successfully
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
 *                     theme:
 *                       type: string
 *                       enum: [light, dark, system]
 *                     language:
 *                       type: string
 *                     timezone:
 *                       type: string
 *                     notifications:
 *                       type: object
 *                     dashboard:
 *                       type: object
 *                     privacy:
 *                       type: object
 *                     accessibility:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getUserPreferences = async (req: Request, res: Response) => {
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

    // Parse preferences from JSON column or return defaults
    const preferences: UserPreferences = user.preferences || {
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        sms: false,
        leadAlerts: true,
        taskReminders: true,
        appointmentReminders: true
      },
      dashboard: {
        defaultView: 'grid',
        showQuickActions: true,
        defaultDateRange: '30d',
        refreshInterval: 300000 // 5 minutes
      },
      privacy: {
        showOnlineStatus: true,
        allowDataCollection: true,
        shareAnalytics: false
      },
      accessibility: {
        fontSize: 'medium',
        highContrast: false,
        reduceMotion: false
      }
    };

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user preferences'
    });
  }
};

/**
 * @swagger
 * /api/settings/preferences:
 *   put:
 *     summary: Update user preferences
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
 *               theme:
 *                 type: string
 *                 enum: [light, dark, system]
 *               language:
 *                 type: string
 *               timezone:
 *                 type: string
 *               notifications:
 *                 type: object
 *               dashboard:
 *                 type: object
 *               privacy:
 *                 type: object
 *               accessibility:
 *                 type: object
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *       400:
 *         description: Invalid preferences data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const updateUserPreferences = async (req: Request, res: Response) => {
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

    // Validate preferences structure
    const allowedFields = ['theme', 'language', 'timezone', 'notifications', 'dashboard', 'privacy', 'accessibility'];
    const preferences = req.body;
    
    // Filter out invalid fields
    const validPreferences = Object.keys(preferences)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = preferences[key];
        return obj;
      }, {} as any);

    // Merge with existing preferences
    const currentPreferences = user.preferences || {};
    const updatedPreferences = { ...currentPreferences, ...validPreferences };

    // Update user preferences
    await userRepository.update(user.id, {
      preferences: updatedPreferences
    });

    res.json({
      success: true,
      data: updatedPreferences,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user preferences'
    });
  }
};

/**
 * @swagger
 * /api/settings/workspace:
 *   get:
 *     summary: Get workspace settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workspace settings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
export const getWorkspaceSettings = async (req: Request, res: Response) => {
  try {
    const workspaceRepository = AppDataSource.getRepository(Workspace);
    const workspace = await workspaceRepository.findOne({
      where: { id: (req as any).workspaceId }
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Workspace not found'
      });
    }

    // Parse settings from JSON column or return defaults
    const settings: WorkspaceSettings = workspace.settings || {
      branding: {
        companyName: workspace.name,
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e'
      },
      features: {
        enablePropertyData: true,
        enableInventory: true,
        enableTransactions: true,
        enableCalendar: true,
        enableWebhooks: true,
        enableAI: false
      },
      security: {
        requireMFA: false,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireNumbers: true,
          requireSymbols: false
        },
        sessionTimeout: 28800000, // 8 hours
        allowedDomains: []
      },
      integrations: {}
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching workspace settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workspace settings'
    });
  }
};

/**
 * @swagger
 * /api/settings/workspace:
 *   put:
 *     summary: Update workspace settings
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
 *               branding:
 *                 type: object
 *               features:
 *                 type: object
 *               security:
 *                 type: object
 *               integrations:
 *                 type: object
 *     responses:
 *       200:
 *         description: Workspace settings updated successfully
 *       400:
 *         description: Invalid settings data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
export const updateWorkspaceSettings = async (req: Request, res: Response) => {
  try {
    const workspaceRepository = AppDataSource.getRepository(Workspace);
    const workspace = await workspaceRepository.findOne({
      where: { id: (req as any).workspaceId }
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: 'Workspace not found'
      });
    }

    // Validate settings structure
    const allowedFields = ['branding', 'features', 'security', 'integrations'];
    const settings = req.body;
    
    // Filter out invalid fields
    const validSettings = Object.keys(settings)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = settings[key];
        return obj;
      }, {} as any);

    // Merge with existing settings
    const currentSettings = workspace.settings || {};
    const updatedSettings = { ...currentSettings, ...validSettings };

    // Update workspace settings
    await workspaceRepository.update(workspace.id, {
      settings: updatedSettings
    });

    res.json({
      success: true,
      data: updatedSettings,
      message: 'Workspace settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating workspace settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update workspace settings'
    });
  }
};

/**
 * @swagger
 * /api/settings/reset:
 *   post:
 *     summary: Reset user preferences to defaults
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferences reset successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const resetUserPreferences = async (req: Request, res: Response) => {
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

    // Reset to default preferences
    const defaultPreferences: UserPreferences = {
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        sms: false,
        leadAlerts: true,
        taskReminders: true,
        appointmentReminders: true
      },
      dashboard: {
        defaultView: 'grid',
        showQuickActions: true,
        defaultDateRange: '30d',
        refreshInterval: 300000
      },
      privacy: {
        showOnlineStatus: true,
        allowDataCollection: true,
        shareAnalytics: false
      },
      accessibility: {
        fontSize: 'medium',
        highContrast: false,
        reduceMotion: false
      }
    };

    await userRepository.update(user.id, {
      preferences: defaultPreferences
    });

    res.json({
      success: true,
      data: defaultPreferences,
      message: 'Preferences reset to defaults successfully'
    });
  } catch (error) {
    console.error('Error resetting user preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset user preferences'
    });
  }
};
