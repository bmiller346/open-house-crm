import { AppDataSource } from '../../data-source';
import { Workspace } from '../../entities/Workspace';
import { User } from '../../entities/User';

export async function listWorkspaces(userId: string): Promise<Workspace[]> {
  const userRepository = AppDataSource.getRepository(User);
  
  const user = await userRepository.findOne({
    where: { id: userId },
    relations: ['workspaces']
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user.workspaces.filter(workspace => workspace.isActive);
}

export async function getWorkspace(workspaceId: string, userId: string): Promise<Workspace | null> {
  const workspaceRepository = AppDataSource.getRepository(Workspace);
  
  const workspace = await workspaceRepository.findOne({
    where: { 
      id: workspaceId,
      users: { id: userId }
    },
    relations: ['users']
  });
  
  return workspace;
}

export async function createWorkspace(data: {
  name: string;
  slug?: string;
  ownerId: string;
  settings?: any;
}): Promise<Workspace> {
  const workspaceRepository = AppDataSource.getRepository(Workspace);
  const userRepository = AppDataSource.getRepository(User);
  
  // Generate slug if not provided
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  
  const workspace = new Workspace();
  workspace.name = data.name;
  workspace.slug = `${slug}-${Date.now()}`;
  workspace.ownerId = data.ownerId;
  workspace.settings = data.settings || {
    timezone: 'America/New_York',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY'
  };
  
  console.log('Creating workspace with ownerId:', data.ownerId);
  const savedWorkspace = await workspaceRepository.save(workspace);
  
  // Add owner to workspace
  await AppDataSource.query(
    'INSERT INTO workspace_users ("workspaceId", "userId") VALUES ($1, $2)',
    [savedWorkspace.id, data.ownerId]
  );
  
  return savedWorkspace;
}

export async function updateWorkspace(
  workspaceId: string,
  userId: string,
  updates: Partial<Pick<Workspace, 'name' | 'settings'>>
): Promise<Workspace> {
  const workspaceRepository = AppDataSource.getRepository(Workspace);
  
  const workspace = await workspaceRepository.findOne({
    where: { 
      id: workspaceId,
      users: { id: userId }
    }
  });
  
  if (!workspace) {
    throw new Error('Workspace not found or access denied');
  }
  
  Object.assign(workspace, updates);
  return await workspaceRepository.save(workspace);
}
