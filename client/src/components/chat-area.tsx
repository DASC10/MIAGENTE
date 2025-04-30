import { Button } from "@/components/ui/button";
import { AgentIcon } from "@/components/agent-icon";
import { useSettings } from "@/context/settings-context";
import { useChat } from "@/context/chat-context";
import { ChatMessage } from "@/components/chat-message";
import { MenuIcon, Settings, RefreshCw, PaperclipIcon, MicIcon } from "lucide-react";
import { useMessageInput, useFormatMessages } from "@/hooks/use-chat";
import { TextareaAutosize } from "@/components/ui/text-area-autosize";
import { useState } from "react";
import { WelcomeScreen } from "@/components/welcome-screen";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ChatAreaProps {
  className?: string;
}

export function ChatArea({ className }: ChatAreaProps) {
  const { toggleSidebar } = useSettings();
  const { currentAgent, currentConversation } = useChat();
  const { message, handleInputChange, handleSubmit, sending, isThinking } = useMessageInput();
  const messages = useFormatMessages();
  const [isSending, setIsSending] = useState(false);
  
  // No messages = show welcome screen
  const showWelcome = messages.length === 0 && !currentConversation;

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-light-bg dark:bg-dark-bg relative">
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-light-border dark:border-dark-border relative z-10">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
          
          {currentAgent && (
            <div className="flex items-center gap-2">
              <AgentIcon 
                name={currentAgent.avatar} 
                color={currentAgent.color} 
                className="w-8 h-8"
                size={20}
              />
              <div>
                <h2 className="font-medium">{currentAgent.name}</h2>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                Personalizar agente
              </DropdownMenuItem>
              <DropdownMenuItem>
                Configurar memoria
              </DropdownMenuItem>
              <DropdownMenuItem>
                Gestionar automatizaciones
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" size="icon">
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div id="chat-messages" className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-4 space-y-6">
        {showWelcome ? (
          <WelcomeScreen />
        ) : (
          messages.map((message, index) => (
            <ChatMessage 
              key={message.id} 
              message={message}
              isLastMessage={index === messages.length - 1} 
            />
          ))
        )}
      </div>

      {/* Message Input Area */}
      <div className="p-3 md:p-4 border-t border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="relative">
            <TextareaAutosize
              value={message}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Escribe un mensaje..."
              maxRows={5}
              minRows={1}
              className="w-full px-4 py-3 bg-light-bg dark:bg-dark-bg rounded-lg border border-light-border dark:border-dark-border focus:outline-none focus:ring-1 focus:ring-primary resize-none pr-10 custom-scrollbar"
              disabled={sending || isThinking}
            />
            <Button 
              type="submit" 
              className="absolute right-2 bottom-2 p-2 rounded-md text-primary hover:bg-light-border dark:hover:bg-dark-border transition-colors"
              disabled={sending || isThinking || !message.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>
          <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-2 flex justify-between">
            <div>
              <Button type="button" variant="ghost" size="sm" className="hover:text-primary transition-colors mr-3 p-0 h-auto">
                <PaperclipIcon className="h-4 w-4 inline mr-1" />
                Adjuntar archivo
              </Button>
              <Button type="button" variant="ghost" size="sm" className="hover:text-primary transition-colors p-0 h-auto">
                <MicIcon className="h-4 w-4 inline mr-1" />
                Grabar audio
              </Button>
            </div>
            <span>Presiona Enter para enviar</span>
          </div>
        </form>
      </div>
    </main>
  );
}
