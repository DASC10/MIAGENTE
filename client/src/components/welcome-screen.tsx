import { Button } from "@/components/ui/button";
import { useAgentSelection } from "@/hooks/use-agents";
import { Layout, Users, Heart, Zap, Pencil } from "lucide-react";
import { motion } from "framer-motion";

export function WelcomeScreen() {
  const { createConversation, agents, creatingConversation } = useAgentSelection();
  
  const handleStartChat = async () => {
    if (agents.length > 0) {
      await createConversation(agents[0].id);
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center h-full text-center px-4 py-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-16 h-16 mb-4 bg-primary/10 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-primary">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 01-.189-.866c0-.298.059-.605.189-.866zm-4.34 7.964a.75.75 0 01-1.061-1.06 5.236 5.236 0 013.73-1.538 5.236 5.236 0 013.695 1.538.75.75 0 11-1.061 1.06 3.736 3.736 0 00-2.639-1.098 3.736 3.736 0 00-2.664 1.098z" clipRule="evenodd" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-2">Bienvenido a Asistente IA Plus</h2>
      <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6 max-w-md">
        Tu asistente inteligente con memoria y capacidades de automatización para ayudarte en tus tareas diarias.
      </p>
      
      <Button 
        className="bg-primary hover:bg-primary/90 text-white mb-8"
        onClick={handleStartChat}
        disabled={creatingConversation}
      >
        Iniciar una conversación
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        {/* Feature Cards */}
        <motion.div 
          className="bg-light-card dark:bg-dark-card p-4 rounded-lg border border-light-border dark:border-dark-border hover:shadow-md transition-shadow"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
            <Layout className="h-6 w-6" />
          </div>
          <h3 className="font-medium mb-1">Múltiples Agentes</h3>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Accede a diversos agentes especializados según tus necesidades.
          </p>
        </motion.div>
        
        <motion.div 
          className="bg-light-card dark:bg-dark-card p-4 rounded-lg border border-light-border dark:border-dark-border hover:shadow-md transition-shadow"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-3">
            <Heart className="h-6 w-6" />
          </div>
          <h3 className="font-medium mb-1">Memoria Persistente</h3>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Los agentes recuerdan tus preferencias y conversaciones anteriores.
          </p>
        </motion.div>
        
        <motion.div 
          className="bg-light-card dark:bg-dark-card p-4 rounded-lg border border-light-border dark:border-dark-border hover:shadow-md transition-shadow"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-3">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="font-medium mb-1">Automatizaciones</h3>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Crea flujos de trabajo automatizados para tareas repetitivas.
          </p>
        </motion.div>
        
        <motion.div 
          className="bg-light-card dark:bg-dark-card p-4 rounded-lg border border-light-border dark:border-dark-border hover:shadow-md transition-shadow"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 mb-3">
            <Pencil className="h-6 w-6" />
          </div>
          <h3 className="font-medium mb-1">Personalización</h3>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Adapta cada agente a tus necesidades específicas.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
