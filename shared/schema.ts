import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  avatar: text("avatar").notNull(),
  color: text("color").notNull(),
  memory: boolean("memory").default(true),
  isAutomated: boolean("is_automated").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true, 
  createdAt: true,
});

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  agentId: integer("agent_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true, 
  createdAt: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  metadata: jsonb("metadata").default({}).notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true, 
  timestamp: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export const automations = pgTable("automations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  agentId: integer("agent_id").notNull(),
  schedule: text("schedule").notNull(), // cron format
  isActive: boolean("is_active").default(true),
  actions: jsonb("actions").default([]).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAutomationSchema = createInsertSchema(automations).omit({
  id: true, 
  createdAt: true,
});

export type InsertAutomation = z.infer<typeof insertAutomationSchema>;
export type Automation = typeof automations.$inferSelect;

// WebSocket Message Types
export type ChatCompletionRequest = {
  type: 'message';
  conversationId: number;
  message: string;
  agentId: number;
};

export type ChatCompletionResponse = {
  type: 'message';
  id: number;
  content: string;
  role: string;
  timestamp: string;
  conversationId: number;
  thinking?: boolean;
};

export type WebSocketMessage = 
  | ChatCompletionRequest 
  | ChatCompletionResponse
  | { type: 'error', message: string }
  | { type: 'ping' }
  | { type: 'pong' };
