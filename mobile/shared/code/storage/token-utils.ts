import { Storage } from '@ionic/storage';
import { AppModule } from '~/app.module';
import { AuthResponse, UserProfileStatus } from '../api/auth.models';

const TOKEN_KEY = 'token';

/**
 * Locally stored data about current authenticated user.
 */
export interface AuthLocalData {
  token: string;
  userUuid: string;
  profileStatus: UserProfileStatus;
}

/**
 * Returns true if AuthLocalData has all fields that previously did not exist
 * and now are required. This may be possible if we read AuthLocalData from
 * persistent storage.
 */
export function isAuthLocalDataComplete(authLocalData: AuthLocalData): boolean {
  return authLocalData !== undefined &&
    authLocalData.token !== undefined &&
    authLocalData.profileStatus !== undefined &&
    authLocalData.userUuid !== undefined;
}

/**
 * Convert auth response received from API to a locally storable format.
 */
export function authResponseToTokenModel(response: AuthResponse): AuthLocalData {
  return {
    token: response.token,
    userUuid: response.user_uuid,
    profileStatus: response.profile_status
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
