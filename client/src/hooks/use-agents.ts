import { useChat } from "@/context/chat-context";
import { Agent, Conversation } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

export function useAgentSelection() {
  const { agents, currentAgent, setCurrentAgent, createNewConversation, setCurrentConversation } = useChat();
  const { toast } = useToast();
  const [creatingConversation, setCreatingConversation] = useState(false);
  
  const selectAgent = async (agent: Agent) => {
    if (currentAgent?.id === agent.id) return;
    
    try {
      setCurrentAgent(agent);
    } catch (error) {
      console.error('Error selecting agent:', error);
      toast({
        title: "Error",
        description: "No se pudo seleccionar el agente. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };
  
  const createConversation = async (agentId: number) => {
    if (creatingConversation) return;
    
    try {
      setCreatingConversation(true);
      const newConversation = await createNewConversation(agentId);
      
      toast({
        title: "Conversación creada",
        description: "Se ha creado una nueva conversación."
      });

      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la conversación. Inténtalo de nuevo.",
        variant: "destructive"
      });
      return null;
    } finally {
      setCreatingConversation(false);
    }
  };
  
  return {
    agents,
    currentAgent,
    selectAgent,
    createConversation,
    creatingConversation
  };
}

export function useConversations() {
  const { conversations, currentConversation, setCurrentConversation } = useChat();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const selectConversation = (conversation: Conversation) => {
    if (currentConversation?.id === conversation.id) return;
    
    try {
      setCurrentConversation(conversation);
    } catch (error) {
      console.error('Error selecting conversation:', error);
      toast({
        title: "Error",
        description: "No se pudo seleccionar la conversación. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };
  
  const deleteConversation = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/conversations/${id}`);
      
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
      }
      
      toast({
        title: "Conversación eliminada",
        description: "La conversación se ha eliminado correctamente."
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la conversación. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };
  
  return {
    conversations,
    currentConversation,
    selectConversation,
    deleteConversation
  };
}
