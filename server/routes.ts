import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import type { WebSocketMessage, ChatCompletionResponse } from "@shared/schema";
import { z } from "zod";
import { insertAgentSchema, insertAutomationSchema, insertConversationSchema, insertMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Keep track of connected clients
  const clients = new Map<WebSocket, { isAlive: boolean }>();

  wss.on('connection', (ws) => {
    clients.set(ws, { isAlive: true });

    // Set up ping interval to detect disconnected clients
    ws.on('pong', () => {
      const clientData = clients.get(ws);
      if (clientData) {
        clientData.isAlive = true;
      }
    });

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString()) as WebSocketMessage;
        
        if (message.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
          return;
        }
        
        if (message.type === 'message') {
          // Send an immediate "thinking" response
          const thinkingResponse: ChatCompletionResponse = {
            type: 'message',
            id: 0,
            content: '',
            role: 'assistant',
            timestamp: new Date().toISOString(),
            conversationId: message.conversationId,
            thinking: true
          };
          ws.send(JSON.stringify(thinkingResponse));

          // Create user message
          const userMessage = await storage.createMessage({
            conversationId: message.conversationId,
            content: message.message,
            role: 'user',
            metadata: {}
          });

          // Simulate AI thinking
          setTimeout(async () => {
            try {
              // Generate AI response
              let responseContent = '';
              
              const agent = await storage.getAgent(message.agentId);
              if (agent) {
                switch (agent.name) {
                  case 'Asistente General':
                    responseContent = `Claro, estoy aquí para ayudarte con cualquier información o tarea que necesites. ${message.message.length > 20 ? 'Tu consulta es interesante y puedo ofrecerte varias perspectivas al respecto.' : '¿En qué más puedo asistirte hoy?'}`;
                    break;
                  case 'Asistente Negocios':
                    responseContent = `Desde una perspectiva de negocios, puedo analizar ${message.message.includes('análisis') ? 'los datos que mencionas y proporcionarte insights estratégicos' : 'diferentes estrategias para optimizar tus resultados'}.`;
                    break;
                  case 'Tutor Académico':
                    responseContent = `Como tutor académico, puedo explicarte ${message.message.includes('explicar') ? 'este concepto en detalle' : 'los fundamentos de este tema'} y proporcionarte recursos adicionales para profundizar tu aprendizaje.`;
                    break;
                  case 'Automatizador':
                    responseContent = `Puedo configurar una automatización para ${message.message.includes('automatizar') ? 'la tarea que mencionas' : 'ayudarte con tareas repetitivas'}. ¿Te gustaría programar una ejecución periódica o basada en eventos?`;
                    break;
                  default:
                    responseContent = `He analizado tu mensaje y puedo ayudarte con esa consulta. ¿Necesitas información adicional sobre algún aspecto específico?`;
                }
              } else {
                responseContent = `Gracias por tu mensaje. Estoy procesando tu consulta y te responderé lo antes posible.`;
              }
              
              // Create assistant message
              const assistantMessage = await storage.createMessage({
                conversationId: message.conversationId,
                content: responseContent,
                role: 'assistant',
                metadata: {}
              });
              
              // Send the response back to the client
              const response: ChatCompletionResponse = {
                type: 'message',
                id: assistantMessage.id,
                content: assistantMessage.content,
                role: assistantMessage.role,
                timestamp: assistantMessage.timestamp.toISOString(),
                conversationId: assistantMessage.conversationId
              };
              
              ws.send(JSON.stringify(response));
            } catch (error) {
              console.error('Error generating AI response:', error);
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: 'Error generating AI response'
              }));
            }
          }, 1500);
        }
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Invalid message format'
        }));
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  // Ping all clients every 30 seconds to detect disconnected clients
  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      const clientData = clients.get(ws);
      if (clientData === undefined) {
        return ws.terminate();
      }
      
      if (clientData.isAlive === false) {
        clients.delete(ws);
        return ws.terminate();
      }
      
      clientData.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(pingInterval);
  });

  // API Routes
  // Agents
  app.get('/api/agents', async (req, res) => {
    try {
      const agents = await storage.getAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching agents' });
    }
  });

  app.get('/api/agents/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const agent = await storage.getAgent(id);
      
      if (!agent) {
        return res.status(404).json({ message: 'Agent not found' });
      }
      
      res.json(agent);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching agent' });
    }
  });

  app.post('/api/agents', async (req, res) => {
    try {
      const validatedData = insertAgentSchema.parse(req.body);
      const agent = await storage.createAgent(validatedData);
      res.status(201).json(agent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid agent data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating agent' });
    }
  });

  app.put('/api/agents/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAgentSchema.partial().parse(req.body);
      const updatedAgent = await storage.updateAgent(id, validatedData);
      
      if (!updatedAgent) {
        return res.status(404).json({ message: 'Agent not found' });
      }
      
      res.json(updatedAgent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid agent data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error updating agent' });
    }
  });

  app.delete('/api/agents/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAgent(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Agent not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting agent' });
    }
  });

  // Conversations
  app.get('/api/conversations', async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching conversations' });
    }
  });

  app.get('/api/conversations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const conversation = await storage.getConversation(id);
      
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching conversation' });
    }
  });

  app.post('/api/conversations', async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.status(201).json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid conversation data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating conversation' });
    }
  });

  app.put('/api/conversations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { title } = req.body;
      
      if (!title || typeof title !== 'string') {
        return res.status(400).json({ message: 'Title is required' });
      }
      
      const updatedConversation = await storage.updateConversation(id, title);
      
      if (!updatedConversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      
      res.json(updatedConversation);
    } catch (error) {
      res.status(500).json({ message: 'Error updating conversation' });
    }
  });

  app.delete('/api/conversations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteConversation(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting conversation' });
    }
  });

  // Messages
  app.get('/api/conversations/:id/messages', async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const conversation = await storage.getConversation(conversationId);
      
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      
      const messages = await storage.getMessages(conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching messages' });
    }
  });

  app.post('/api/messages', async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid message data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating message' });
    }
  });

  // Automations
  app.get('/api/automations', async (req, res) => {
    try {
      const agentId = req.query.agentId ? parseInt(req.query.agentId as string) : undefined;
      const automations = await storage.getAutomations(agentId);
      res.json(automations);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching automations' });
    }
  });

  app.get('/api/automations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const automation = await storage.getAutomation(id);
      
      if (!automation) {
        return res.status(404).json({ message: 'Automation not found' });
      }
      
      res.json(automation);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching automation' });
    }
  });

  app.post('/api/automations', async (req, res) => {
    try {
      const validatedData = insertAutomationSchema.parse(req.body);
      const automation = await storage.createAutomation(validatedData);
      res.status(201).json(automation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid automation data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating automation' });
    }
  });

  app.put('/api/automations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAutomationSchema.partial().parse(req.body);
      const updatedAutomation = await storage.updateAutomation(id, validatedData);
      
      if (!updatedAutomation) {
        return res.status(404).json({ message: 'Automation not found' });
      }
      
      res.json(updatedAutomation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid automation data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error updating automation' });
    }
  });

  app.delete('/api/automations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAutomation(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Automation not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting automation' });
    }
  });

  return httpServer;
}
