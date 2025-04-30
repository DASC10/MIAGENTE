import { Button } from "@/components/ui/button";
import { AgentIcon } from "@/components/agent-icon";
import { useSettings } from "@/context/settings-context";
import { useAgentSelection, useConversations } from "@/hooks/use-agents";
import { PlusIcon, MessageCircleIcon, UserIcon, ChevronDownIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Agent, Conversation } from "@shared/schema";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { theme, setTheme, isSidebarOpen, closeSidebar } = useSettings();
  const { agents, currentAgent, selectAgent, createConversation, creatingConversation } = useAgentSelection();
  const { conversations, currentConversation, selectConversation } = useConversations();
  const [hoveredAgent, setHoveredAgent] = useState<number | null>(null);
  const [hoveredConversation, setHoveredConversation] = useState<number | null>(null);
  
  const handleNewChat = async () => {
    if (currentAgent) {
      const conversation = await createConversation(currentAgent.id);
      if (conversation) {
        selectConversation(conversation);
      }
    }
  };
  
  const handleAgentClick = (agent: Agent) => {
    selectAgent(agent);
  };
  
  const handleConversationClick = (conversation: Conversation) => {
    selectConversation(conversation);
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-20 bg-black"
            onClick={closeSidebar}
          />
          
          {/* Sidebar */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={cn(
              "w-80 h-full flex-shrink-0 bg-light-sidebar dark:bg-dark-sidebar border-r border-light-border dark:border-dark-border flex flex-col transition-all duration-300 ease-in-out md:relative fixed z-30 h-full",
              className
            )}
          >
            {/* Header */}
            <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="w-6 h-6 text-primary"
                >
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 01-.189-.866c0-.298.059-.605.189-.866zm-4.34 7.964a.75.75 0 01-1.061-1.06 5.236 5.236 0 013.73-1.538 5.236 5.236 0 013.695 1.538.75.75 0 11-1.061 1.06 3.736 3.736 0 00-2.639-1.098 3.736 3.736 0 00-2.664 1.098z" clipRule="evenodd" />
                </svg>
                Asistente IA Plus
              </h1>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={closeSidebar}
                className="md:hidden"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>

            {/* New Chat Button */}
            <div className="p-4">
              <Button 
                className="w-full bg-primary hover:bg-opacity-90 text-white flex items-center justify-center gap-2"
                onClick={handleNewChat}
                disabled={creatingConversation}
              >
                <PlusIcon className="h-5 w-5" />
                Nueva conversación
              </Button>
            </div>

            {/* Agents Section */}
            <div className="p-4 border-b border-light-border dark:border-dark-border">
              <h2 className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-3">
                TUS AGENTES
              </h2>
              
              {/* Agent List */}
              <div className="space-y-2">
                {agents.map(agent => (
                  <button
                    key={agent.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-md hover:bg-light-border dark:hover:bg-dark-border cursor-pointer transition-colors group relative w-full text-left",
                      currentAgent?.id === agent.id && "bg-light-border dark:bg-dark-border"
                    )}
                    onClick={() => handleAgentClick(agent)}
                    onMouseEnter={() => setHoveredAgent(agent.id)}
                    onMouseLeave={() => setHoveredAgent(null)}
                  >
                    <AgentIcon 
                      name={agent.avatar} 
                      color={agent.color} 
                      className="w-8 h-8"
                      size={20}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{agent.name}</h3>
                      <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                        {agent.description}
                      </p>
                    </div>
                    {currentAgent?.id === agent.id && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                    {(hoveredAgent === agent.id || currentAgent?.id === agent.id) && (
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                        </Button>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Create Custom Agent Button */}
              <Button
                variant="outline"
                className="mt-4 w-full border-dashed hover:border-primary dark:hover:border-primary text-light-text-secondary dark:text-dark-text-secondary"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Crear agente personalizado
              </Button>
            </div>

            {/* History Section */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-4">
                <h2 className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-3">
                  HISTORIAL DE CHATS
                </h2>
                
                <div className="space-y-1">
                  {conversations.map(conversation => (
                    <button
                      key={conversation.id}
                      className={cn(
                        "p-2 rounded-md hover:bg-light-border dark:hover:bg-dark-border cursor-pointer transition-colors flex items-center truncate w-full text-left",
                        currentConversation?.id === conversation.id && "bg-light-border dark:bg-dark-border"
                      )}
                      onClick={() => handleConversationClick(conversation)}
                      onMouseEnter={() => setHoveredConversation(conversation.id)}
                      onMouseLeave={() => setHoveredConversation(null)}
                    >
                      <MessageCircleIcon className="h-4 w-4 mr-2 flex-shrink-0 text-light-text-tertiary dark:text-dark-text-tertiary" />
                      <span className="truncate">{conversation.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Settings & Account Section */}
            <div className="p-4 border-t border-light-border dark:border-dark-border">
              {/* Theme toggle */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm">Modo oscuro</span>
                <Switch 
                  checked={theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>

              {/* Account */}
              <div className="flex items-center justify-between p-2 hover:bg-light-border dark:hover:bg-dark-border rounded-md cursor-pointer transition-colors mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden text-primary">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">Mi Cuenta</div>
                    <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">Plan Plus</div>
                  </div>
                </div>
                <ChevronDownIcon className="h-5 w-5 text-light-text-tertiary dark:text-dark-text-tertiary" />
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
