import { useState } from "react";
import { useChat } from "@/context/chat-context";
import { Message } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useMessageInput() {
  const [message, setMessage] = useState("");
  const { sendMessage, isThinking, currentConversation, currentAgent, createNewConversation } = useChat();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const handleInputChange = (value: string) => {
    setMessage(value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!message.trim() || sending || isThinking) return;
    
    try {
      setSending(true);
      
      // If no conversation exists, create one first
      if (!currentConversation && currentAgent) {
        await createNewConversation(currentAgent.id);
      }
      
      await sendMessage(message);
      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return {
    message,
    handleInputChange,
    handleSubmit,
    sending,
    isThinking
  };
}

export function useFormatMessages() {
  const { messages, isThinking } = useChat();
  
  // Add "thinking" message if the AI is currently thinking
  const formattedMessages = [...messages];
  
  if (isThinking) {
    formattedMessages.push({
      id: -1,
      conversationId: messages.length > 0 ? messages[0].conversationId : -1,
      content: "",
      role: "thinking",
      timestamp: new Date(),
      metadata: {}
    } as Message);
  }
  
  return formattedMessages;
}
