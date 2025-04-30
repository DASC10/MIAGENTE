import { cn } from "@/lib/utils";
import { LucideIcon, Users, Briefcase, GraduationCap, Zap, Bot, Settings } from "lucide-react";

interface AgentIconProps {
  name: string;
  color?: string;
  className?: string;
  size?: number;
}

export function AgentIcon({ name, color, className, size = 16 }: AgentIconProps) {
  let Icon: LucideIcon = Bot;
  
  // Map avatar name to Lucide icon
  switch (name.toLowerCase()) {
    case 'users':
      Icon = Users;
      break;
    case 'briefcase':
      Icon = Briefcase;
      break;
    case 'graduation-cap':
      Icon = GraduationCap;
      break;
    case 'zap':
      Icon = Zap;
      break;
    case 'settings':
      Icon = Settings;
      break;
    default:
      Icon = Bot;
  }
  
  return (
    <div 
      className={cn(
        "rounded-full flex items-center justify-center", 
        className
      )}
      style={{
        backgroundColor: color ? `${color}10` : 'var(--primary)10',
        color: color || 'var(--primary)'
      }}
    >
      <Icon size={size} />
    </div>
  );
}
