import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { Agent, Conversation, Message, WebSocketMessage, ChatCompletionResponse } from "@shared/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import webSocketClient from "@/lib/websocket";
import netlifyClient from "@/lib/netlify-client";
import { apiRequest } from "@/lib/queryClient";

// Determinar qué cliente usar basado en el entorno
const client = import.meta.env.PROD && import.meta.env.VITE_NETLIFY === 'true' 
  ? netlifyClient 
  : webSocketClient;

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  agents: Agent[];
  currentAgent: Agent | null;
  loadingMessages: boolean;
  isThinking: boolean;
  sendMessage: (message: string) => Promise<void>;
  createNewConversation: (agentId: number) => Promise<Conversation>;
  setCurrentConversation: (conversation: Conversation) => void;
  setCurrentAgent: (agent: Agent) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const queryClient = useQueryClient();

  // Fetch agents
  const { data: agents = [], isLoading: loadingAgents } = useQuery({
    queryKey: ['/api/agents'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch conversations
  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ['/api/conversations'],
    staleTime: 1000 * 60, // 1 minute
  });

  // Fetch messages for current conversation
  const { data: currentMessages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['/api/conversations', currentConversation?.id, 'messages'],
    enabled: !!currentConversation,
  });

  // Update messages when they change
  useEffect(() => {
    if (currentMessages && currentMessages.length > 0) {
      setMessages(currentMessages);
    } else {
      setMessages([]);
    }
  }, [currentMessages]);

  // Set default agent when agents are loaded
  useEffect(() => {
    if (agents.length > 0 && !currentAgent) {
      setCurrentAgent(agents[0]);
    }
  }, [agents, currentAgent]);

  // Connect to WebSocket or Netlify client
  useEffect(() => {
    client.connect().catch(console.error);

    const handleMessage = (message: ChatCompletionResponse) => {
      if (message.thinking) {
        setIsThinking(true);
        return;
      }
      
      setIsThinking(false);
      
      // Add the new message to the existing messages
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', message.conversationId, 'messages'] });
    };

    client.on('message', handleMessage);

    return () => {
      client.off('message', handleMessage);
    };
  }, [queryClient]);

  // Send a message
  const sendMessage = async (content: string) => {
    if (!currentConversation || !currentAgent) return;

    try {
      // Create a user message
      await apiRequest('POST', '/api/messages', {
        conversationId: currentConversation.id,
        content,
        role: 'user',
        metadata: {}
      });

      // Invalidate messages to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', currentConversation.id, 'messages'] });

      // Send message to WebSocket for AI response
      client.send({
        type: 'message',
        conversationId: currentConversation.id,
        message: content,
        agentId: currentAgent.id
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Create a new conversation
  const createNewConversation = async (agentId: number) => {
    try {
      const res = await apiRequest('POST', '/api/conversations', {
        title: 'Nueva conversación',
        agentId
      });
      
      const newConversation = await res.json();
      
      // Invalidate conversations cache
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      
      // Set as current conversation
      setCurrentConversation(newConversation);
      
      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        agents,
        currentAgent,
        loadingMessages,
        isThinking,
        sendMessage,
        createNewConversation,
        setCurrentConversation,
        setCurrentAgent
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
