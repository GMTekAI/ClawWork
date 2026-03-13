import { ipcMain } from 'electron';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { tasks, messages } from '../db/schema.js';

interface CreateTaskParams {
  id: string;
  sessionKey: string;
  sessionId: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  artifactDir: string;
}

interface UpdateTaskParams {
  id: string;
  title?: string;
  status?: string;
  updatedAt: string;
}

interface CreateMessageParams {
  id: string;
  taskId: string;
  role: string;
  content: string;
  timestamp: string;
}

function ipcError(err: unknown): { ok: false; error: string } {
  return { ok: false, error: err instanceof Error ? err.message : 'unknown' };
}

export function registerDataHandlers(): void {
  ipcMain.handle('data:create-task', (_event, task: CreateTaskParams) => {
    try {
      const db = getDb();
      db.insert(tasks).values({
        id: task.id,
        sessionKey: task.sessionKey,
        sessionId: task.sessionId,
        title: task.title,
        status: task.status,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        tags: JSON.stringify(task.tags),
        artifactDir: task.artifactDir,
      }).run();
      return { ok: true };
    } catch (err) {
      console.error('[data] create-task failed:', err);
      return ipcError(err);
    }
  });

  ipcMain.handle('data:update-task', (_event, params: UpdateTaskParams) => {
    try {
      const db = getDb();
      const updates: Record<string, string> = { updatedAt: params.updatedAt };
      if (params.title !== undefined) updates.title = params.title;
      if (params.status !== undefined) updates.status = params.status;
      db.update(tasks).set(updates).where(eq(tasks.id, params.id)).run();
      return { ok: true };
    } catch (err) {
      console.error('[data] update-task failed:', err);
      return ipcError(err);
    }
  });

  ipcMain.handle('data:create-message', (_event, msg: CreateMessageParams) => {
    try {
      const db = getDb();
      db.insert(messages).values({
        id: msg.id,
        taskId: msg.taskId,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      }).run();
      return { ok: true };
    } catch (err) {
      console.error('[data] create-message failed:', err);
      return ipcError(err);
    }
  });
}
