import axios from 'axios';

const rompslompApi = axios.create({
  baseURL: process.env.ROMPLOMP_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.ROMPLOMP_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

export interface RompslompTask {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  assigned_to?: string;
}

export class RompslompService {
  static async createTask(taskData: CreateTaskRequest): Promise<RompslompTask> {
    try {
      const response = await rompslompApi.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      console.error('Failed to create Rompslomp task:', error);
      throw new Error('Failed to create task in Rompslomp');
    }
  }

  static async getTask(taskId: string): Promise<RompslompTask> {
    try {
      const response = await rompslompApi.get(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch Rompslomp task:', error);
      throw new Error('Failed to fetch task from Rompslomp');
    }
  }

  static async updateTask(taskId: string, updates: Partial<CreateTaskRequest>): Promise<RompslompTask> {
    try {
      const response = await rompslompApi.put(`/tasks/${taskId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Failed to update Rompslomp task:', error);
      throw new Error('Failed to update task in Rompslomp');
    }
  }

  static async listTasks(filters?: {
    status?: string;
    assigned_to?: string;
    priority?: string;
  }): Promise<RompslompTask[]> {
    try {
      const response = await rompslompApi.get('/tasks', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Failed to list Rompslomp tasks:', error);
      throw new Error('Failed to list tasks from Rompslomp');
    }
  }

  static async completeTask(taskId: string): Promise<RompslompTask> {
    try {
      const response = await rompslompApi.put(`/tasks/${taskId}`, {
        status: 'completed'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to complete Rompslomp task:', error);
      throw new Error('Failed to complete task in Rompslomp');
    }
  }
} 