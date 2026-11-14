import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// Owner-only data. Neither table has a public read API.
export const feedback = sqliteTable('feedback', {
  id: text('id').primaryKey(),
  sessionHash: text('session_hash').notNull(),
  createdAt: integer('created_at').notNull(),
  kind: text('kind', { enum: ['impression', 'idea', 'problem'] }).notNull(),
  message: text('message').notNull(),
  email: text('email'),
  page: text('page').notNull(),
}, table => [index('feedback_created_at').on(table.createdAt), index('feedback_session_time').on(table.sessionHash, table.createdAt)]);

// Short-lived write capabilities, unrelated to visitor identity. No IP tracking.
export const feedbackSessions = sqliteTable('feedback_sessions', {
  tokenHash: text('token_hash').primaryKey(),
  createdAt: integer('created_at').notNull(),
  expiresAt: integer('expires_at').notNull(),
}, table => [index('feedback_sessions_time').on(table.createdAt)]);
