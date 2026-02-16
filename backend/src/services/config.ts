import { configRepository } from '../repositories/config';
import type { UserConfig, UpdateConfigInput } from '../types/index';

export const configService = {
  async getUserConfig(userId: string): Promise<UserConfig> {
    let config = await configRepository.findByUserId(userId);
    
    if (!config) {
      config = await configRepository.create(userId);
    }
    
    return config;
  },

  async updateUserConfig(userId: string, updates: UpdateConfigInput): Promise<UserConfig | null> {
    if (updates.temperature !== undefined && (updates.temperature < 0 || updates.temperature > 2)) {
      throw new Error('Temperature must be between 0 and 2');
    }

    if (updates.maxTokens !== undefined && (updates.maxTokens < 1 || updates.maxTokens > 4096)) {
      throw new Error('Max tokens must be between 1 and 4096');
    }

    return configRepository.update(userId, updates);
  },

  async resetUserConfig(userId: string): Promise<UserConfig> {
    const defaultConfig = await configRepository.getDefaultConfig();
    const updated = await configRepository.update(userId, defaultConfig);
    
    if (!updated) {
      return configRepository.create(userId);
    }
    
    return updated;
  },
};