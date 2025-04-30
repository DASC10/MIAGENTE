import { 
  users, 
  type User, 
  type InsertUser, 
  agents, 
  type Agent, 
  type InsertAgent,
  conversations,
  type Conversation,
  type InsertConversation,
  messages,
  type Message,
  type InsertMessage,
  automations,
  type Automation,
  type InsertAutomation
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Agents
  getAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: number, agent: Partial<InsertAgent>): Promise<Agent | undefined>;
  deleteAgent(id: number): Promise<boolean>;

  // Conversations
  getConversations(): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, title: string): Promise<Conversation | undefined>;
  deleteConversation(id: number): Promise<boolean>;

  // Messages
  getMessages(conversationId: number): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Automations
  getAutomations(agentId?: number): Promise<Automation[]>;
  getAutomation(id: number): Promise<Automation | undefined>;
  createAutomation(automation: InsertAutomation): Promise<Automation>;
  updateAutomation(id: number, automation: Partial<InsertAutomation>): Promise<Automation | undefined>;
  deleteAutomation(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private agentsData: Map<number, Agent>;
  private conversationsData: Map<number, Conversation>;
  private messagesData: Map<number, Message>;
  private automationsData: Map<number, Automation>;
  
  private currentUserId: number;
  private currentAgentId: number;
  private currentConversationId: number;
  private currentMessageId: number;
  private currentAutomationId: number;

  constructor() {
    this.users = new Map();
    this.agentsData = new Map();
    this.conversationsData = new Map();
    this.messagesData = new Map();
    this.automationsData = new Map();
    
    this.currentUserId = 1;
    this.currentAgentId = 1;
    this.currentConversationId = 1;
    this.currentMessageId = 1;
    this.currentAutomationId = 1;
    
    // Initialize with default agents
    this.setupDefaultAgents();
  }

  private setupDefaultAgents() {
    const defaultAgents: InsertAgent[] = [
      {
        name: "Asistente General",
        description: "Asistente IA versátil e inteligente",
        avatar: "users",
        color: "#10B981",
        memory: true,
        isAutomated: false,
      },
      {
        name: "Asistente Negocios",
        description: "Especialista en estrategia y análisis",
        avatar: "briefcase",
        color: "#6366F1",
        memory: true,
        isAutomated: false,
      },
      {
        name: "Tutor Académico",
        description: "Experto en educación y enseñanza",
        avatar: "graduation-cap",
        color: "#EC4899",
        memory: true,
        isAutomated: false,
      },
      {
        name: "Automatizador",
        description: "Especialista en tareas automáticas",
        avatar: "zap",
        color: "#F59E0B",
        memory: true,
        isAutomated: true,
      }
    ];

    defaultAgents.forEach(agent => {
      this.createAgent(agent);
    });

    // Add some sample conversations
    const sampleConversations: InsertConversation[] = [
      { title: "Estrategia de marketing digital", agentId: 2 },
      { title: "Análisis de datos del Q3 2023", agentId: 2 },
      { title: "Optimización de procesos automatizados", agentId: 4 },
      { title: "Desarrollo de contenido para redes sociales", agentId: 1 }
    ];

    sampleConversations.forEach(conversation => {
      this.createConversation(conversation);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Agents
  async getAgents(): Promise<Agent[]> {
    return Array.from(this.agentsData.values());
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    return this.agentsData.get(id);
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = this.currentAgentId++;
    const createdAt = new Date();
    const agent: Agent = { ...insertAgent, id, createdAt };
    this.agentsData.set(id, agent);
    return agent;
  }

  async updateAgent(id: number, agentUpdate: Partial<InsertAgent>): Promise<Agent | undefined> {
    const agent = this.agentsData.get(id);
    if (!agent) return undefined;
    
    const updatedAgent = { ...agent, ...agentUpdate };
    this.agentsData.set(id, updatedAgent);
    return updatedAgent;
  }

  async deleteAgent(id: number): Promise<boolean> {
    return this.agentsData.delete(id);
  }

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversationsData.values());
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversationsData.get(id);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const createdAt = new Date();
    const conversation: Conversation = { ...insertConversation, id, createdAt };
    this.conversationsData.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: number, title: string): Promise<Conversation | undefined> {
    const conversation = this.conversationsData.get(id);
    if (!conversation) return undefined;
    
    const updatedConversation = { ...conversation, title };
    this.conversationsData.set(id, updatedConversation);
    return updatedConversation;
  }

  async deleteConversation(id: number): Promise<boolean> {
    return this.conversationsData.delete(id);
  }

  // Messages
  async getMessages(conversationId: number): Promise<Message[]> {
    return Array.from(this.messagesData.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async getMessage(id: number): Promise<Message | undefined> {
    return this.messagesData.get(id);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const timestamp = new Date();
    const message: Message = { ...insertMessage, id, timestamp };
    this.messagesData.set(id, message);
    return message;
  }

  // Automations
  async getAutomations(agentId?: number): Promise<Automation[]> {
    const automations = Array.from(this.automationsData.values());
    if (agentId) {
      return automations.filter(automation => automation.agentId === agentId);
    }
    return automations;
  }

  async getAutomation(id: number): Promise<Automation | undefined> {
    return this.automationsData.get(id);
  }

  async createAutomation(insertAutomation: InsertAutomation): Promise<Automation> {
    const id = this.currentAutomationId++;
    const createdAt = new Date();
    const automation: Automation = { ...insertAutomation, id, createdAt };
    this.automationsData.set(id, automation);
    return automation;
  }

  async updateAutomation(id: number, automationUpdate: Partial<InsertAutomation>): Promise<Automation | undefined> {
    const automation = this.automationsData.get(id);
    if (!automation) return undefined;
    
    const updatedAutomation = { ...automation, ...automationUpdate };
    this.automationsData.set(id, updatedAutomation);
    return updatedAutomation;
  }

  async deleteAutomation(id: number): Promise<boolean> {
    return this.automationsData.delete(id);
  }
}

export const storage = new MemStorage();
