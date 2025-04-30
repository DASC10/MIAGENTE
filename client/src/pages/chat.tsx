import { Sidebar } from "@/components/sidebar";
import { ChatArea } from "@/components/chat-area";
import { useSettings } from "@/context/settings-context";
import { useEffect } from "react";

export default function Chat() {
  const { isSidebarOpen, openSidebar } = useSettings();
  
  // Open sidebar by default on desktop
  useEffect(() => {
    if (window.innerWidth >= 768) {
      openSidebar();
    }
  }, [openSidebar]);
  
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <ChatArea />
    </div>
  );
}
