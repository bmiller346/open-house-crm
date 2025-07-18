// 🔑 Auth service (to be implemented)
import { UserCredentials, AuthResult } from './types';

export async function authenticateUser(credentials: UserCredentials): Promise<AuthResult> {
  // TODO: validate user credentials, generate JWT
  throw new Error('Not implemented');
}
