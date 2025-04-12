import React from 'react';
import { Plus, X, MessageSquare, Trash2, Sun, Moon } from 'lucide-react';

export function Sidebar({
  chats,
  currentChatId,
  isDarkMode,
  isSidebarOpen,
  onCreateNewChat,
  onDeleteChat,
  onSelectChat,
  onToggleDarkMode,
  onCloseSidebar,
}) {
  return (
    <div 
      className={`fixed md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64 h-screen bg-gray-900 dark:bg-gray-900 text-white p-4 flex flex-col z-20`}
    >
      <button 
        className="absolute right-4 top-4 md:hidden"
        onClick={onCloseSidebar}
      >
        <X size={24} />
      </button>
      <button 
        onClick={onCreateNewChat}
        className="flex items-center gap-2 w-full p-3 rounded-md border border-gray-700 hover:bg-gray-700 transition-colors"
      >
        <Plus size={16} />
        New Chat
      </button>
      <div className="mt-4 flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div 
            key={chat.id} 
            className={`flex items-center justify-between p-3 rounded-md hover:bg-gray-800 cursor-pointer ${
              currentChatId === chat.id ? 'bg-gray-800' : ''
            }`}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <MessageSquare size={16} />
              <span className="truncate">{chat.title}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat.id);
              }}
              className="p-1 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={onToggleDarkMode}
        className="mt-4 flex items-center gap-2 p-3 rounded-md hover:bg-gray-800 transition-colors"
      >
        {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
    </div>
  );
}