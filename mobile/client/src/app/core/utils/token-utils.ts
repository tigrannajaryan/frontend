import { Storage } from '@ionic/storage';
import { AppModule } from '~/app.module';
import { Logger } from '~/shared/logger';
import { AuthTokenModel } from '~/auth/auth.models';

const TOKEN_KEY = 'token';
const logger = new Logger();

async function getStorage(): Promise<Storage> {
  const storage = AppModule.injector.get(Storage);
  await storage.ready();
  return storage;
}

export async function saveToken(tokenData: AuthTokenModel): Promise<void> {
  const storage = await getStorage();
  logger.warn('SAVE TOKEN', tokenData);
  return storage.set(TOKEN_KEY, JSON.stringify(tokenData));
}

export async function getToken(): Promise<AuthTokenModel> {
  const storage = await getStorage();
  const token = await storage.get(TOKEN_KEY);
  const tokenData = JSON.parse(token);
  return tokenData;
}

export async function deleteToken(): Promise<void> {
  const storage = await getStorage();
  logger.warn('REMOVE TOKEN');
  return storage.remove(TOKEN_KEY);
}
