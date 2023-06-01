/* eslint-disable lines-between-class-members */
import { RedisClient } from 'redis';
import { promisify } from 'util';

export class CacheService {
  private getAsync: (key: string) => Promise<string | null>;
  private setAsync: (key: string, value: string) => Promise<'OK'>;
  private delAsync: (key: string) => Promise<number>;
  private quitAsync: () => Promise<void>;

  constructor(public client: RedisClient) {
    this.getAsync = promisify(client.get).bind(client);
    this.setAsync = promisify(client.set).bind(client);
    this.delAsync = promisify(client.del).bind(client);
    this.quitAsync = promisify(client.quit).bind(client);
  }

  public async get(key: string): Promise<string | null> {
    const cachedData = await this.getAsync(key);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    return null;
  }

  public async set(key: string, data: unknown): Promise<void> {
    await this.setAsync(key, JSON.stringify(data));
  }

  public async del(key: string): Promise<void> {
    await this.delAsync(key);
  }
}
