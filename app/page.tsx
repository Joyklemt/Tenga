import Sidebar from "@/components/Sidebar";
import ChatView from "@/components/ChatView";
import MessageInput from "@/components/MessageInput";

export default function Home() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <ChatView />
        <MessageInput />
      </main>
    </div>
  );
}
