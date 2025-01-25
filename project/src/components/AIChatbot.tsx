import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, X, Sparkles } from 'lucide-react';
import { OpenAIService } from '../services/openai';
import { useAIChatStore } from '../store/aiChatStore';

interface AIChatbotProps {
  onInterestsGenerated: (interests: string[]) => void;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ onInterestsGenerated }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const messages = useAIChatStore(state => state.messages);
  const addMessage = useAIChatStore(state => state.addMessage);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setError(null);
    setIsLoading(true);

    try {
      addMessage({ role: 'user', content: userMessage });
      const response = await OpenAIService.generateResponse(userMessage);
      addMessage({ role: 'assistant', content: response });

      // Extract interests from response and notify parent
      const interests = extractInterests(response);
      if (interests.length > 0) {
        onInterestsGenerated(interests);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghasilkan respons';
      setError(errorMessage);
      console.error('AI Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const extractInterests = (text: string): string[] => {
    const interestRegex = /\[(.*?)\]/g;
    const matches = text.match(interestRegex);
    return matches ? matches.map(m => m.slice(1, -1)) : [];
  };

  const handleInterestClick = (interest: string) => {
    const searchInput = document.querySelector('input[placeholder*="Search interests"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = interest;
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Trigger the Enter key event to add the interest
      const enterEvent = new KeyboardEvent('keypress', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        bubbles: true
      });
      searchInput.dispatchEvent(enterEvent);
    }
  };

  const formatMessageContent = (content: string) => {
    return content.split(/(\[.*?\])/).map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const interest = part.slice(1, -1);
        return (
          <button
            key={index}
            onClick={() => handleInterestClick(interest)}
            className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors inline-flex items-center gap-1 mx-1"
          >
            {interest}
            <span className="text-blue-400 text-xs">+</span>
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const examplePrompts = [
    "Saya ingin promosi kedai kopi di Jakarta untuk profesional muda",
    "Mau jualan aksesoris fashion handmade untuk wanita 25-35 tahun",
    "Ingin pasang iklan kursus digital marketing online",
    "Mau buka pusat kebugaran khusus wanita"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 translate-y-2' 
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        {isOpen ? (
          <>
            <X size={20} />
            <span className="font-medium">Tutup Asisten</span>
          </>
        ) : (
          <>
            <Bot size={20} />
            <span className="font-medium">AI Asisten</span>
          </>
        )}
      </button>

      <div
        ref={chatWindowRef}
        className={`absolute bottom-20 right-0 w-[400px] transform transition-all duration-300 ease-in-out ${
          isOpen
            ? 'translate-y-0 opacity-100'
            : 'translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xl">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-xl">
            <div className="flex items-center gap-2">
              <Bot size={24} />
              <div>
                <h3 className="font-medium">Asisten Meta Ads</h3>
                <p className="text-xs text-blue-100">Powered by AI Analytics</p>
              </div>
            </div>
          </div>

          <div className="h-[450px] overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full">
                    <Sparkles size={24} />
                  </div>
                  <h4 className="font-medium text-gray-900">Bagaimana saya bisa membantu?</h4>
                  <p className="text-sm text-gray-600">
                    Ceritakan tentang bisnis Anda dan saya akan sarankan strategi target audiens terbaik.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Coba contoh ini:</p>
                  <div className="grid gap-2">
                    {examplePrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setMessage(prompt);
                          inputRef.current?.focus();
                        }}
                        className="text-left px-4 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                      >
                        "{prompt}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="whitespace-pre-line text-sm leading-relaxed">
                      {formatMessageContent(msg.content)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-100">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <X size={16} />
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tanyakan tentang strategi target audiens..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors ${
                  isLoading || !message.trim()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};