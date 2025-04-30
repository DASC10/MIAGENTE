import express, { Request, Response, NextFunction } from 'express';
import { HandlerEvent, HandlerContext } from '@netlify/functions';
import serverless from 'serverless-http';
import { storage } from '../../server/storage';
import { WebSocketMessage, ChatCompletionResponse } from '../../shared/schema';
import { z } from 'zod';
import { 
  insertAgentSchema, 
  insertAutomationSchema, 
  insertConversationSchema, 
  insertMessageSchema 
} from '../../shared/schema';

// Crear la aplicación Express
const app = express();
app.use(express.json());

// Configurar CORS para Netlify
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
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
    
    // Para API REST simple, creamos inmediatamente la respuesta del asistente
    if (message.role === 'user') {
      setTimeout(async () => {
        try {
          // Generate AI response
          let responseContent = '';
          
          const agent = await storage.getAgent(req.body.agentId || 1);
          if (agent) {
            switch (agent.name) {
              case 'Asistente General':
                responseContent = `Claro, estoy aquí para ayudarte con cualquier información o tarea que necesites. ${message.content.length > 20 ? 'Tu consulta es interesante y puedo ofrecerte varias perspectivas al respecto.' : '¿En qué más puedo asistirte hoy?'}`;
                break;
              case 'Asistente Negocios':
                responseContent = `Desde una perspectiva de negocios, puedo analizar ${message.content.includes('análisis') ? 'los datos que mencionas y proporcionarte insights estratégicos' : 'diferentes estrategias para optimizar tus resultados'}.`;
                break;
              case 'Tutor Académico':
                responseContent = `Como tutor académico, puedo explicarte ${message.content.includes('explicar') ? 'este concepto en detalle' : 'los fundamentos de este tema'} y proporcionarte recursos adicionales para profundizar tu aprendizaje.`;
                break;
              case 'Automatizador':
                responseContent = `Puedo configurar una automatización para ${message.content.includes('automatizar') ? 'la tarea que mencionas' : 'ayudarte con tareas repetitivas'}. ¿Te gustaría programar una ejecución periódica o basada en eventos?`;
                break;
              default:
                responseContent = `He analizado tu mensaje y puedo ayudarte con esa consulta. ¿Necesitas información adicional sobre algún aspecto específico?`;
            }
          } else {
            responseContent = `Gracias por tu mensaje. Estoy procesando tu consulta y te responderé lo antes posible.`;
          }
          
          // Create assistant message
          await storage.createMessage({
            conversationId: message.conversationId,
            content: responseContent,
            role: 'assistant',
            metadata: {}
          });
        } catch (error) {
          console.error('Error generating AI response:', error);
        }
      }, 1000);
    }
    
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

// Para manejo de errores general
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Exportar el handler para Netlify Functions
const handler = serverless(app);

// Función principal que Netlify llamará
export async function handler(event: HandlerEvent, context: HandlerContext) {
  return handler(event, context);
}