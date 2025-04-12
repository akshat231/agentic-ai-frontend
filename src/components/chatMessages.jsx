import React from 'react';
import { MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function ChatMessages({ currentChat }) {
  if (!currentChat) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <MessageSquare size={48} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Welcome to Reddit Agent</h1>
          <p>Select a chat or start a new conversation.</p>
        </div>
      </div>
    );
  }

  if (currentChat.messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <MessageSquare size={48} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Start New Conversation</h1>
          <p>Type a message below to begin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {currentChat.messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] p-4 rounded-lg prose prose-sm dark:prose-invert ${
              message.isUser
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-md'
            }`}
          >
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
}
