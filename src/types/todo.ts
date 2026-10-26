import { z, type ZodTypeDef } from 'zod';

export interface ITodoItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  userId: string;
  tagIds: readonly string[];
}

export const todoSchema: z.ZodType<ITodoItem, ZodTypeDef, unknown> = z.object({
  id: z.coerce.string(),
  title: z.string(),
  completed: z.boolean(),
  createdAt: z.string(),
  userId: z.coerce.string(),
  tagIds: z.array(z.string()).default([]),
});

export const todoListSchema: z.ZodType<ITodoItem[], ZodTypeDef, unknown> = z.array(todoSchema);

export type TodoFilter = 'all' | 'active' | 'done';

export interface CreateTodoPayload {
  title: string;
  completed: boolean;
  createdAt: string;
  userId: string;
  tagIds: string[];
}

export interface UpdateTodoPayload {
  title?: string;
  completed?: boolean;
}

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
});

export type User = z.infer<typeof userSchema>;

export const settingsSchema = z.object({
  name: z.string(),
  dark: z.boolean(),
});

export type UserSettings = z.infer<typeof settingsSchema>;
