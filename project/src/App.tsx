import React from 'react';
import { LoginButton } from './components/LoginButton';
import { AudienceSearch } from './components/AudienceSearch';
import { AudienceResults } from './components/AudienceResults';
import { AudienceFilters } from './components/AudienceFilters';
import { useAuthStore } from './store/authStore';
import { useAIChatStore } from './store/aiChatStore';
import { LayoutGrid, Bot, X, Send, Loader2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { OpenAIService } from './services/openai';

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [audiences, setAudiences] = React.useState([]);
  const [activeFilters, setActiveFilters] = React.useState({
    location: 'ID',
    gender: 'female',
    age: '18-24',
    budget: '10',
    objective: 'CONVERSIONS',
    placement: 'automatic'
  });
  const [message, setMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  const messages = useAIChatStore(state => state.messages);
  const addMessage = useAIChatStore(state => state.addMessage);

  const handleFiltersChange = React.useCallback((newFilters) => {
    setActiveFilters(newFilters);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate response';
      setError(errorMessage);
      console.error('AI Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm">
            <div className="p-8">
              <div className="flex justify-center mb-8">
                <div className="flex items-center gap-2 bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-4 rounded-2xl">
                  <LayoutGrid size={28} />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
                Audience Explorer
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Connect your account to explore audience insights
              </p>

              <LoginButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white/80 border-b border-gray-200 sticky top-0 z-20 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2.5 rounded-xl">
                <LayoutGrid size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-br from-blue-600 to-indigo-600">
                  Audience Explorer
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* AI Assistant Sidebar */}
        <div 
          className={`fixed top-16 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-10 ${
            isSidebarCollapsed ? 'w-[60px]' : 'w-[350px]'
          }`}
        >
          {/* AI Chat Indicator - Only show when collapsed */}
          {isSidebarCollapsed && (
            <div className="absolute -right-20 top-8 transform -rotate-90 bg-blue-600 text-white px-3 py-1.5 rounded-t-lg text-sm font-medium flex items-center gap-2 shadow-sm">
              <Bot size={16} />
              <span>AI Chat</span>
            </div>
          )}

          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition-colors z-50"
            aria-label={isSidebarCollapsed ? "Expand AI chat" : "Collapse AI chat"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight size={18} className="text-gray-600" />
            ) : (
              <ChevronLeft size={18} className="text-gray-600" />
            )}
          </button>

          {/* Expanded State */}
          <div className={`h-full flex flex-col transition-opacity duration-300 ${
            isSidebarCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'
          }`}>
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-2 bg-blue-50 text-blue-600 p-2 rounded-lg">
                  <Bot size={20} />
                  <Sparkles size={16} />
                </div>
                <h2 className="text-lg font-medium text-gray-900">AI Assistant</h2>
              </div>
              <p className="text-sm text-gray-600">
                How can I help you today? Ask me anything about marketing, business strategy, or audience targeting.
              </p>
            </div>

            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map((msg, index) => (
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
                    <p className="whitespace-pre-line text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {error && (
              <div className="bg-red-50 border-t border-red-100 p-3">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <X size={16} />
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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

          {/* Collapsed State */}
          {isSidebarCollapsed && (
            <div className="absolute inset-0 flex flex-col items-center pt-4 gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Bot size={24} className="text-blue-600" />
              </div>
              {messages.length > 0 && (
                <div className="relative w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                  <MessageSquare size={20} className="text-gray-600" />
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {messages.length}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-[60px]' : 'ml-[350px]'
        }`}>
          <div className="max-w-[1600px] mx-auto p-6 space-y-6">
            <div className="bg-white/80 rounded-2xl border border-gray-200/50 shadow-sm backdrop-blur-sm p-6">
              <AudienceSearch onSearchResults={setAudiences} activeFilters={activeFilters} />
            </div>
            <AudienceFilters onFiltersChange={handleFiltersChange} />
            <AudienceResults audiences={audiences} activeFilters={activeFilters} />
          </div>
        </div>
      </div>
    </div>
  );
}