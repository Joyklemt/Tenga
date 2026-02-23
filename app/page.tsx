'use client';

import { useState, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";
import ChatView from "@/components/ChatView";
import MessageInput from "@/components/MessageInput";

export default function Home() {
  // State to track if sidebar is open on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  // Close sidebar when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <div className="app-container">
      {/* Overlay for mobile - darkens background when sidebar is open */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={handleOverlayClick}
      />
      
      {/* Sidebar with open/close state */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <main className="main-content">
        {/* Chat view with mobile menu button */}
        <ChatView onMenuClick={() => setSidebarOpen(true)} />
        <MessageInput />
      </main>
    </div>
  );
}
