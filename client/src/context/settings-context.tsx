import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { Theme, getTheme, setTheme, initializeTheme } from "@/lib/theme";

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  closeSidebar: () => void;
  openSidebar: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getTheme);
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(window.innerWidth >= 768);
  
  useEffect(() => {
    const cleanup = initializeTheme();
    return cleanup;
  }, []);
  
  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    setThemeState(newTheme);
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };
  
  const closeSidebar = () => {
    setSidebarOpen(false);
  };
  
  const openSidebar = () => {
    setSidebarOpen(true);
  };
  
  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <SettingsContext.Provider value={{ 
      theme, 
      setTheme: changeTheme,
      toggleSidebar,
      isSidebarOpen,
      closeSidebar,
      openSidebar
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a ThemeProvider");
  }
  return context;
}
