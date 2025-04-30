import { WebSocketMessage, ChatCompletionResponse } from "@shared/schema";
import { apiRequest } from "./queryClient";

// Esta clase simula la funcionalidad WebSocket para entornos que no lo soportan
class NetlifyClient {
  private static instance: NetlifyClient;
  private listeners: Map<string, Function[]> = new Map();
  private pollInterval: number | null = null;
  private isPolling = false;
  private lastMessageId = 0;
  
  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): NetlifyClient {
    if (!NetlifyClient.instance) {
      NetlifyClient.instance = new NetlifyClient();
    }
    return NetlifyClient.instance;
  }

  public connect(): Promise<void> {
    return Promise.resolve();
  }

  public send(message: WebSocketMessage): void {
    if (message.type === 'message') {
      // Usamos el API REST para enviar mensajes
      apiRequest('POST', '/api/messages', {
        conversationId: message.conversationId,
        content: message.message,
        role: 'user',
        metadata: {}
      }).then(async (response) => {
        const userMessage = await response.json();
        
        // Emitimos un evento "thinking" para simular el WebSocket
        this.emit('message', {
          type: 'message',
          id: 0,
          content: '',
          role: 'assistant',
          timestamp: new Date().toISOString(),
          conversationId: message.conversationId,
          thinking: true
        } as ChatCompletionResponse);
        
        // Comenzamos a consultar los mensajes para obtener la respuesta del asistente
        this.startPolling(message.conversationId);
      }).catch(error => {
        console.error('Error sending message:', error);
      });
    }
  }

  private startPolling(conversationId: number) {
    this.isPolling = true;
    this.lastMessageId = 0;
    
    // Consultamos los mensajes cada segundo
    this.pollInterval = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/conversations/${conversationId}/messages`);
        if (!response.ok) {
          throw new Error('Error fetching messages');
        }
        
        const messages = await response.json();
        // Obtenemos el último mensaje del asistente
        const lastAssistantMessage = [...messages]
          .filter(m => m.role === 'assistant')
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        
        if (lastAssistantMessage && lastAssistantMessage.id !== this.lastMessageId) {
          this.lastMessageId = lastAssistantMessage.id;
          
          // Emitimos el mensaje como si viniera del WebSocket
          this.emit('message', {
            type: 'message',
            id: lastAssistantMessage.id,
            content: lastAssistantMessage.content,
            role: lastAssistantMessage.role,
            timestamp: lastAssistantMessage.timestamp,
            conversationId: conversationId
          } as ChatCompletionResponse);
          
          // Detenemos el polling una vez que hemos recibido la respuesta
          this.stopPolling();
        }
      } catch (error) {
        console.error('Error polling messages:', error);
        this.stopPolling();
      }
    }, 1000);
  }

  private stopPolling() {
    if (this.pollInterval !== null) {
      window.clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isPolling = false;
  }

  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      return;
    }
    
    const callbacks = this.listeners.get(event)!;
    const index = callbacks.indexOf(callback);
    
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  private emit(event: string, data: any): void {
    if (!this.listeners.has(event)) {
      return;
    }
    
    this.listeners.get(event)!.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} event handler:`, error);
      }
    });
  }

  public close(): void {
    this.stopPolling();
  }
}

export default NetlifyClient.getInstance();