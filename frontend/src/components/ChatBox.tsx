import React, { useState } from 'react';
import { Message } from '../types';
import { LoadingDots } from './LoadingDots';

interface ChatBoxProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement> & {
    'data-testid'?: string;
  };
  sendButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    'data-testid'?: string;
  };
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  onSendMessage,
  isLoading,
  inputProps = {},
  sendButtonProps = {}
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4 max-h-[50vh] overflow-y-auto p-2" data-testid="chat-messages">
        {messages.map((message, index) => (
          <div
            key={`${message.timestamp}-${index}`}
            className={`p-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-primary text-primary-foreground ml-8'
                : 'bg-muted text-muted-foreground mr-8'
            }`}
            data-testid="chat-message"
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-center p-4" data-testid="chat-loading">
            <LoadingDots />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="flex-1 px-4 py-2 rounded-lg bg-muted"
          {...inputProps}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
          {...sendButtonProps}
        >
          Send
        </button>
      </form>
    </div>
  );
}; 