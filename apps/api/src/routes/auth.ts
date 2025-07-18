/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user and get access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 * 
 * /auth/linkedin:
 *   get:
 *     summary: Initiate LinkedIn OAuth login
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to LinkedIn OAuth
 */

import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import fs from 'fs';
import path from 'path';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { Workspace } from '../entities/Workspace';

const router = Router();

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Passport configuration
// Load Google OAuth Configuration from JSON file
let googleConfig = null;
try {
  const googleClientSecretPath = path.join(__dirname, '..', '..', 'google-client-secret.json');
  if (fs.existsSync(googleClientSecretPath)) {
    const googleClientSecret = fs.readFileSync(googleClientSecretPath, 'utf8');
    googleConfig = JSON.parse(googleClientSecret);
  }
} catch (error) {
  console.error('❌ Failed to load Google OAuth credentials:', error);
}

// Configure OAuth strategies only if credentials are provided
if (googleConfig && googleConfig.web) {
  passport.use(new GoogleStrategy({
    clientID: googleConfig.web.client_id,
    clientSecret: googleConfig.web.client_secret,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    
    // Check if user exists with Google ID
    let user = await userRepository.findOne({ 
      where: { googleId: profile.id },
      relations: ['workspaces']
    });

    console.log('🔍 User found by Google ID:', user ? 'YES' : 'NO');
    if (user) {
      console.log('🔍 User workspaces count:', user.workspaces?.length || 0);
    }

    if (!user) {
      // Check if user exists with same email
      user = await userRepository.findOne({ 
        where: { email: profile.emails?.[0]?.value },
        relations: ['workspaces']
      });

      if (user) {
        // Link Google account to existing user
        user.googleId = profile.id;
        await userRepository.save(user);
      } else {
        // Create new user
        user = userRepository.create({
          email: profile.emails?.[0]?.value || '',
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          avatar: profile.photos?.[0]?.value,
          googleId: profile.id,
          isEmailVerified: true,
          preferences: {
            theme: 'light',
            notifications: {
              email: true,
              push: true,
              sms: false,
            },
            dashboard: {
              defaultView: 'grid',
              showQuickActions: true,
              defaultDateRange: '30d',
              refreshInterval: 30
            },
            privacy: {
              shareAnalytics: true,
              allowCookies: true,
              marketingEmails: true
            },
            accessibility: {
              highContrast: false,
              reducedMotion: false,
              fontSize: 'medium'
            }
          },
        });
        await userRepository.save(user);
      }
    }

    // Ensure user has at least one workspace
    console.log('🔍 User workspaces before check:', user.workspaces);
    if (!user.workspaces || user.workspaces.length === 0) {
      console.log('⚠️ User has no workspaces, creating one...');
      const workspaceRepository = AppDataSource.getRepository(Workspace);
      const workspace = workspaceRepository.create({
        name: `${user.firstName}'s Workspace`,
        slug: `${user.firstName.toLowerCase()}-workspace-${Date.now()}`,
        ownerId: user.id,
        subscriptionPlan: 'free',
        settings: {
          timezone: 'America/New_York',
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY',
        },
      });
      await workspaceRepository.save(workspace);
      console.log('✅ Workspace created:', workspace.id);

      // Associate user with workspace
      await userRepository.query(`
        INSERT INTO workspace_users ("workspaceId", "userId")
        VALUES ($1, $2)
      `, [workspace.id, user.id]);
      console.log('✅ User associated with workspace');
      
      // Reload user with workspaces
      user = await userRepository.findOne({
        where: { id: user.id },
        relations: ['workspaces']
      });
      
      console.log('🔍 User workspaces after reload:', user?.workspaces);
      
      if (!user) {
        throw new Error('Failed to reload user after workspace creation');
      }
    }

    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));
}

if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_ID !== 'your-linkedin-client-id') {
  passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID!,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
  callbackURL: process.env.LINKEDIN_CALLBACK_URL || '/auth/linkedin/callback',
  scope: ['r_emailaddress', 'r_liteprofile']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    
    let user = await userRepository.findOne({ 
      where: { linkedinId: profile.id },
      relations: ['workspaces']
    });

    if (!user) {
      user = await userRepository.findOne({ 
        where: { email: profile.emails?.[0]?.value },
        relations: ['workspaces']
      });

      if (user) {
        user.linkedinId = profile.id;
        await userRepository.save(user);
      } else {
        user = userRepository.create({
          email: profile.emails?.[0]?.value || '',
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          avatar: profile.photos?.[0]?.value,
          linkedinId: profile.id,
          isEmailVerified: true,
          preferences: {
            theme: 'light',
            notifications: {
              email: true,
              push: true,
              sms: false,
            },
            dashboard: {
              defaultView: 'grid',
              showQuickActions: true,
              defaultDateRange: '30d',
              refreshInterval: 30
            },
            privacy: {
              shareAnalytics: true,
              allowCookies: true,
              marketingEmails: true
            },
            accessibility: {
              highContrast: false,
              reducedMotion: false,
              fontSize: 'medium'
            }
          },
        });
        await userRepository.save(user);

        // Create default workspace
        const workspaceRepository = AppDataSource.getRepository(Workspace);
        const workspace = workspaceRepository.create({
          name: `${user.firstName}'s Workspace`,
          slug: `${user.firstName.toLowerCase()}-workspace-${Date.now()}`,
          ownerId: user.id,
          subscriptionPlan: 'free',
          settings: {
            timezone: 'America/New_York',
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY',
          },
        });
        await workspaceRepository.save(workspace);

        await userRepository.query(`
          INSERT INTO workspace_users ("workspaceId", "userId")
          VALUES ($1, $2)
        `, [workspace.id, user.id]);
      }
    }

    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));
}

// Generate tokens
const generateTokens = (user: User) => {
  const payload = { 
    userId: user.id, 
    email: user.email,
    workspaces: user.workspaces?.map(w => w.id) || []
  };
  
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
  
  return { accessToken, refreshToken };
};

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { email },
      relations: ['workspaces']
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await userRepository.save(user);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          preferences: user.preferences,
          workspaces: user.workspaces
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, workspaceName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    const userRepository = AppDataSource.getRepository(User);
    const workspaceRepository = AppDataSource.getRepository(Workspace);

    // Check if user already exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = userRepository.create({
      email,
      firstName,
      lastName,
      passwordHash: hashedPassword,
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        dashboard: {
          defaultView: 'grid',
          showQuickActions: true,
          defaultDateRange: '30d',
          refreshInterval: 30
        },
        privacy: {
          shareAnalytics: true,
          allowCookies: true,
          marketingEmails: true
        },
        accessibility: {
          highContrast: false,
          reducedMotion: false,
          fontSize: 'medium'
        }
      },
    });
    await userRepository.save(user);

    // Create workspace
    const workspace = workspaceRepository.create({
      name: workspaceName || `${firstName}'s Workspace`,
      slug: `${firstName.toLowerCase()}-workspace-${Date.now()}`,
      ownerId: user.id,
      subscriptionPlan: 'free',
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
      },
    });
    await workspaceRepository.save(workspace);

    // Associate user with workspace
    await userRepository.query(`
      INSERT INTO workspace_users ("workspaceId", "userId")
      VALUES ($1, $2)
    `, [workspace.id, user.id]);

    // Load user with workspaces
    const userWithWorkspaces = await userRepository.findOne({
      where: { id: user.id },
      relations: ['workspaces']
    });

    const { accessToken, refreshToken } = generateTokens(userWithWorkspaces!);
    userWithWorkspaces!.refreshToken = refreshToken;
    await userRepository.save(userWithWorkspaces!);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: userWithWorkspaces!.id,
          email: userWithWorkspaces!.email,
          firstName: userWithWorkspaces!.firstName,
          lastName: userWithWorkspaces!.lastName,
          preferences: userWithWorkspaces!.preferences,
          workspaces: userWithWorkspaces!.workspaces
        },
        workspace,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    const userRepository = AppDataSource.getRepository(User);
    
    const user = await userRepository.findOne({
      where: { id: decoded.userId, refreshToken },
      relations: ['workspaces']
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    user.refreshToken = newRefreshToken;
    await userRepository.save(user);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }
});

// POST /auth/logout
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      const userRepository = AppDataSource.getRepository(User);
      await userRepository.update(decoded.userId, { refreshToken: undefined });
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const user = req.user as User;
      
      // Reload user with workspaces relation
      const userRepository = AppDataSource.getRepository(User);
      const userWithWorkspaces = await userRepository.findOne({
        where: { id: user.id },
        relations: ['workspaces']
      });
      
      if (!userWithWorkspaces) {
        throw new Error('User not found');
      }
      
      const { accessToken, refreshToken } = generateTokens(userWithWorkspaces);
      
      userWithWorkspaces.refreshToken = refreshToken;
      userWithWorkspaces.lastLoginAt = new Date();
      await userRepository.save(userWithWorkspaces);

      // Prepare user data for frontend
      const userData = {
        id: userWithWorkspaces.id,
        email: userWithWorkspaces.email,
        firstName: userWithWorkspaces.firstName,
        lastName: userWithWorkspaces.lastName,
        avatar: userWithWorkspaces.avatar,
        workspaceId: userWithWorkspaces.workspaces?.[0]?.id || null,
        workspaces: userWithWorkspaces.workspaces?.map(w => ({ id: w.id, name: w.name, slug: w.slug })) || []
      };

      // Encode user data as base64
      const userDataEncoded = Buffer.from(JSON.stringify(userData)).toString('base64');

      // Redirect to frontend with tokens and user data
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}&refresh=${refreshToken}&user=${userDataEncoded}`;
      res.redirect(redirectUrl);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
    }
  }
);

// LinkedIn OAuth routes
router.get('/linkedin', passport.authenticate('linkedin', { scope: ['r_emailaddress', 'r_liteprofile'] }));

router.get('/linkedin/callback',
  passport.authenticate('linkedin', { session: false }),
  async (req, res) => {
    try {
      const user = req.user as User;
      
      // Reload user with workspaces relation
      const userRepository = AppDataSource.getRepository(User);
      const userWithWorkspaces = await userRepository.findOne({
        where: { id: user.id },
        relations: ['workspaces']
      });
      
      if (!userWithWorkspaces) {
        throw new Error('User not found');
      }
      
      const { accessToken, refreshToken } = generateTokens(userWithWorkspaces);
      
      userWithWorkspaces.refreshToken = refreshToken;
      userWithWorkspaces.lastLoginAt = new Date();
      await userRepository.save(userWithWorkspaces);

      // Prepare user data for frontend
      const userData = {
        id: userWithWorkspaces.id,
        email: userWithWorkspaces.email,
        firstName: userWithWorkspaces.firstName,
        lastName: userWithWorkspaces.lastName,
        avatar: userWithWorkspaces.avatar,
        workspaceId: userWithWorkspaces.workspaces?.[0]?.id || null,
        workspaces: userWithWorkspaces.workspaces?.map(w => ({ id: w.id, name: w.name, slug: w.slug })) || []
      };

      // Encode user data as base64
      const userDataEncoded = Buffer.from(JSON.stringify(userData)).toString('base64');

      // Redirect to frontend with tokens and user data
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}&refresh=${refreshToken}&user=${userDataEncoded}`;
      res.redirect(redirectUrl);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
    }
  }
);

export { router as authRouter };
