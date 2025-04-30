import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/context/chat-context";
import { apiRequest } from "@/lib/queryClient";

export function AutomationsForm() {
  const [name, setName] = useState("Análisis Ventas Semanal");
  const [frequency, setFrequency] = useState("weekly");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { currentAgent } = useChat();
  
  const handleSubmit = async () => {
    if (!currentAgent) return;
    
    try {
      setIsSubmitting(true);
      
      // Create the automation
      await apiRequest('POST', '/api/automations', {
        name,
        description: "Automatización para análisis semanal de ventas",
        agentId: currentAgent.id,
        schedule: frequency === "weekly" ? "0 9 * * 1" : "0 9 * * *", // 9am daily or Monday
        isActive: true,
        actions: [
          {
            type: "analysis",
            params: {
              dataSource: "sales_data",
              frequency: frequency,
              outputFormat: "report"
            }
          }
        ]
      });
      
      toast({
        title: "Automatización configurada",
        description: "La automatización ha sido configurada correctamente."
      });
    } catch (error) {
      console.error('Error creating automation:', error);
      toast({
        title: "Error",
        description: "No se pudo configurar la automatización. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-secondary/5 p-3 rounded-md border border-secondary/20 mt-4">
      <h4 className="font-medium flex items-center gap-2 text-secondary mb-2">
        <Zap className="h-5 w-5" />
        Configuración de Automatización
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <label className="block text-xs font-medium mb-1 text-light-text-secondary dark:text-dark-text-secondary">
            Nombre de la automatización
          </label>
          <Input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-light-text-secondary dark:text-dark-text-secondary">
            Frecuencia
          </label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona frecuencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Semanal (Lunes)</SelectItem>
              <SelectItem value="daily">Diario</SelectItem>
              <SelectItem value="monthly">Mensual</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button 
          className="bg-secondary text-white hover:bg-opacity-90 transition-colors"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          Configurar
        </Button>
        <Button variant="outline">
          Cancelar
        </Button>
      </div>
    </div>
  );
}
