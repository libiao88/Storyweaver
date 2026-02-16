import { storyRepository } from '../repositories/stories';
import type { CreateStoryInput, Story } from '../types/index';

export const storyService = {
  async getAllStories(userId: string): Promise<Story[]> {
    return storyRepository.findAllByUserId(userId);
  },

  async getStoryById(id: string, userId: string): Promise<Story | null> {
    return storyRepository.findById(id, userId);
  },

  async createStory(input: CreateStoryInput): Promise<Story> {
    if (!input.title || !input.module) {
      throw new Error('Missing required fields');
    }

    return storyRepository.create(input);
  },

  async updateStory(id: string, userId: string, updates: Partial<CreateStoryInput>): Promise<Story | null> {
    return storyRepository.update(id, userId, updates);
  },

  async deleteStory(id: string, userId: string): Promise<boolean> {
    return storyRepository.delete(id, userId);
  },

  async searchStories(userId: string, query: string): Promise<Story[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    return storyRepository.search(userId, query.trim());
  },
};