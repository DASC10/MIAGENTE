import { AgentIcon } from "@/components/agent-icon";
import { Message } from "@shared/schema";
import { ClipboardIcon, MicIcon, User, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useChat } from "@/context/chat-context";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { AutomationsForm } from "@/components/automations-form";

interface ChatMessageProps {
  message: Message;
  isLastMessage?: boolean;
}

export function ChatMessage({ message, isLastMessage }: ChatMessageProps) {
  const { currentAgent } = useChat();
  const [showActions, setShowActions] = useState(false);
  const isUser = message.role === 'user';
  const isThinking = message.role === 'thinking';
  
  // Format the timestamp
  const formattedTime = message.timestamp instanceof Date 
    ? format(message.timestamp, 'h:mm a', { locale: es })
    : '';
  
  // Animation variants
  const messageVariants = {
    hidden: { 
      opacity: 0,
      y: 10 
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: { 
        type: 'spring',
        damping: 20,
        stiffness: 300
      }
    }
  };

  if (isThinking) {
    return (
      <motion.div
        className="flex"
        initial="hidden"
        animate="visible"
        variants={messageVariants}
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary mr-3 mt-1">
          <AgentIcon
            name={currentAgent?.avatar || 'bot'}
            color={currentAgent?.color}
            size={20}
          />
        </div>
        <div>
          <div className="flex gap-1 px-4 py-3">
            <span className="w-2 h-2 rounded-full bg-light-text-tertiary dark:bg-dark-text-tertiary animate-pulse-custom"></span>
            <span className="w-2 h-2 rounded-full bg-light-text-tertiary dark:bg-dark-text-tertiary animate-pulse-custom" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2 h-2 rounded-full bg-light-text-tertiary dark:bg-dark-text-tertiary animate-pulse-custom" style={{ animationDelay: '0.4s' }}></span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(
        "flex", 
        isUser && "justify-end"
      )}
      initial="hidden"
      animate="visible"
      variants={messageVariants}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary mr-3 mt-1">
          <AgentIcon
            name={currentAgent?.avatar || 'bot'}
            color={currentAgent?.color}
            size={20}
          />
        </div>
      )}
      
      <div className="max-w-3xl">
        <div className={cn(
          "p-4 rounded-lg shadow-sm",
          isUser ? "bg-primary text-white" : "bg-light-card dark:bg-dark-card"
        )}>
          {message.content ? message.content.split('\n\n').map((paragraph, i) => (
            <p key={i} className={i < message.content.split('\n\n').length - 1 ? "mb-3" : ""}>
              {paragraph}
            </p>
          )) : null}
          
          {/* Optional automation form */}
          {!isUser && message.content && message.content.includes('automatización') && isLastMessage && (
            <AutomationsForm />
          )}
        </div>
        
        <div className={cn(
          "flex items-center mt-2 text-light-text-tertiary dark:text-dark-text-tertiary text-sm",
          isUser ? "justify-end" : ""
        )}>
          {!isUser && showActions && (
            <>
              <Button variant="ghost" size="icon" className="h-6 w-6 mr-2">
                <ClipboardIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 mr-2">
                <MicIcon className="h-4 w-4" />
              </Button>
            </>
          )}
          
          <span className="text-xs">{formattedTime}</span>
          
          {isUser && showActions && (
            <>
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-2">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-2">
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-gray-600 ml-3 mt-1">
          <User className="h-5 w-5" />
        </div>
      )}
    </motion.div>
  );
}
