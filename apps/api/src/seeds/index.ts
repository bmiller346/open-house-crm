import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { Workspace } from '../entities/Workspace';
import * as bcrypt from 'bcrypt';

interface SeedData {
  users: Partial<User>[];
  workspaces: Partial<Workspace>[];
}

const seedData: SeedData = {
  users: [
    {
      email: 'admin@openhouse.dev',
      firstName: 'Admin',
      lastName: 'User',
      phone: '(555) 123-4567',
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
    },
    {
      email: 'john.investor@example.com',
      firstName: 'John',
      lastName: 'Investor',
      phone: '(555) 987-6543',
      isEmailVerified: true,
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          sms: true,
        },
        dashboard: {
          defaultView: 'list',
          showQuickActions: false,
          defaultDateRange: '90d',
          refreshInterval: 60
        },
        privacy: {
          shareAnalytics: false,
          allowCookies: true,
          marketingEmails: false
        },
        accessibility: {
          highContrast: false,
          reducedMotion: false,
          fontSize: 'medium'
        }
      },
    },
  ],
  workspaces: [
    {
      name: 'Demo Workspace',
      slug: 'demo-workspace',
      ownerId: '', // Will be set to admin user ID
      subscriptionPlan: 'pro',
      isActive: true,
      settings: {
        timezone: 'America/Chicago',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        branding: {
          primaryColor: '#007AFF',
          secondaryColor: '#5856D6',
        },
        integrations: {},
      },
    },
    {
      name: 'John\'s Investment Company',
      slug: 'johns-investments',
      ownerId: '', // Will be set to john user ID
      subscriptionPlan: 'enterprise',
      isActive: true,
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        branding: {
          primaryColor: '#FF6B6B',
          secondaryColor: '#4ECDC4',
        },
        integrations: {},
      },
    },
  ],
};

export async function runSeeds() {
  try {
    console.log('🌱 Starting database seeding...');

    const userRepository = AppDataSource.getRepository(User);
    const workspaceRepository = AppDataSource.getRepository(Workspace);

    // Clear existing data in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Clearing existing data...');
      await userRepository.query('TRUNCATE TABLE workspace_users CASCADE');
      await userRepository.query('TRUNCATE TABLE workspaces CASCADE');
      await userRepository.query('TRUNCATE TABLE users CASCADE');
    }

    // Create users
    console.log('👥 Creating users...');
    const createdUsers: User[] = [];
    
    for (const userData of seedData.users) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = userRepository.create({
        ...userData,
        passwordHash: hashedPassword,
      });
      const savedUser = await userRepository.save(user);
      createdUsers.push(savedUser);
      console.log(`   ✅ Created user: ${savedUser.email}`);
    }

    // Update workspace owner IDs
    seedData.workspaces[0].ownerId = createdUsers[0].id; // Admin workspace
    seedData.workspaces[1].ownerId = createdUsers[1].id; // John's workspace

    // Create workspaces
    console.log('🏢 Creating workspaces...');
    const createdWorkspaces: Workspace[] = [];
    
    for (const workspaceData of seedData.workspaces) {
      const workspace = workspaceRepository.create(workspaceData);
      const savedWorkspace = await workspaceRepository.save(workspace);
      createdWorkspaces.push(savedWorkspace);
      console.log(`   ✅ Created workspace: ${savedWorkspace.name}`);
    }

    // Create workspace-user associations
    console.log('🔗 Creating workspace associations...');
    
    // Admin user in demo workspace
    await userRepository.query(`
      INSERT INTO workspace_users ("workspaceId", "userId")
      VALUES ($1, $2)
    `, [createdWorkspaces[0].id, createdUsers[0].id]);
    
    // John in his own workspace
    await userRepository.query(`
      INSERT INTO workspace_users ("workspaceId", "userId")
      VALUES ($1, $2)
    `, [createdWorkspaces[1].id, createdUsers[1].id]);
    
    // Admin also has access to John's workspace (for demo purposes)
    await userRepository.query(`
      INSERT INTO workspace_users ("workspaceId", "userId")
      VALUES ($1, $2)
    `, [createdWorkspaces[1].id, createdUsers[0].id]);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Seed Summary:');
    console.log(`   👥 Users created: ${createdUsers.length}`);
    console.log(`   🏢 Workspaces created: ${createdWorkspaces.length}`);
    console.log('\n🔐 Default Login Credentials:');
    console.log('   Email: admin@openhouse.dev');
    console.log('   Password: password123');
    console.log('\n   Email: john.investor@example.com');
    console.log('   Password: password123');

    return {
      users: createdUsers,
      workspaces: createdWorkspaces,
    };
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Run seeds if this file is executed directly
if (require.main === module) {
  AppDataSource.initialize()
    .then(() => runSeeds())
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { runSeeds as seedDatabase };
