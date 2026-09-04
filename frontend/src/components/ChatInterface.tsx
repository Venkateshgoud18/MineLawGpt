import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, BookOpen, Mic, Square } from 'lucide-react';
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
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleAudioUpload(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleAudioUpload = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      
      const response = await axios.post('http://localhost:8000/speech/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data && response.data.text) {
        setInputValue(prev => {
           const newText = prev ? `${prev} ${response.data.text}` : response.data.text;
           return newText;
        });
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Failed to transcribe audio. Please ensure backend is running and OpenAI key is valid.');
    } finally {
      setIsLoading(false);
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
          className={`glass-button action-button mic-button ${isRecording ? 'recording' : ''}`}
          onClick={toggleRecording}
          disabled={isLoading && !isRecording}
          title={isRecording ? "Stop Recording" : "Start Recording"}
          style={isRecording ? { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.5)' } : {}}
        >
          {isRecording ? <Square size={18} color="#ef4444" /> : <Mic size={18} />}
        </button>
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
