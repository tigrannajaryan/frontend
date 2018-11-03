import { Storage } from '@ionic/storage';
import { AppModule } from '~/app.module';
import { AuthResponse } from '../api/auth.models';

const TOKEN_KEY = 'token';

/**
 * Locally stored data about current authenticated user.
 */
export interface AuthLocalData {
  token: string;
  user_uuid: string;
  created_at?: number; // timestamp
}

/**
 * Convert auth response received from API to a locally storable format.
 */
export function authResponseToTokenModel(response: AuthResponse): AuthLocalData {
  return {
    created_at: response.created_at,
    token: response.token,
    user_uuid: response.user_uuid
  };
}

async function getStorage(): Promise<Storage> {
  const storage = AppModule.injector.get(Storage);
  await storage.ready();
  return storage;
}

/**
 * Save authentication information in a persistent storage
 */
export async function saveAuthLocalData(authLocalData: AuthLocalData): Promise<void> {
  const storage = await getStorage();
  return storage.set(TOKEN_KEY, JSON.stringify(authLocalData));
}

/**
 * Get previously saved authentication information from persistent storage
 */
export async function getAuthLocalData(): Promise<AuthLocalData> {
  const storage = await getStorage();
  const token = await storage.get(TOKEN_KEY);
  const authLocalData = JSON.parse(token);
  return authLocalData;
}

/**
 * Delete previously saved authentication information from persistent storage
 */
export async function deleteAuthLocalData(): Promise<void> {
  const storage = await getStorage();
  return storage.remove(TOKEN_KEY);
}
