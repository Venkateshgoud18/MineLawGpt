import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, BookOpen } from 'lucide-react';
import './components.css';


interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

interface Source {
  document: string;
  page: number;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: 'Hello! I am MineLawGPT, your intelligent assistant for mining regulatory compliance. Ask me anything about mining laws, safety regulations, or environmental guidelines based on the documents you have uploaded.'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/chat/', {
        question: userMessage.content
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.answer,
        sources: response.data.sources
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please ensure the backend server is running and your OpenAI API key is valid.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (

    <div className="glass-panel chat-container animate-fade-in">
      <div className="chat-header">
        <div className="header-title">
          <Bot color="var(--accent-primary)" size={24} />
          <h2>MineLawGPT Chat</h2>
        </div>
        <div className="status-indicator">
          <span className="pulse-dot"></span>
          Ready
        </div>
      </div>

      <div className="chat-messages custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-wrapper ${msg.role}`}>
            <div className="avatar">
              {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className="message-content">
              <div className="text">{msg.content}</div>
              
              {/* Render sources if available and not empty */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="sources-container">
                  <div className="sources-title">
                    <BookOpen size={14} />
                    <span>Sources:</span>
                  </div>
                  <div className="sources-list">
                    {msg.sources.map((source, idx) => (
                      <span key={idx} className="source-tag">
                        {source.document} (Pg. {source.page})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message-wrapper assistant">
            <div className="avatar">
              <Bot size={20} />
            </div>
            <div className="message-content loading">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          className="glass-input chat-textarea custom-scrollbar"
          placeholder="Ask a question about mining regulations..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
        />
        <button 
          className="glass-button primary-button send-button" 
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
