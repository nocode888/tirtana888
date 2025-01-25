import React, { useState } from 'react';
import { BarChart3, Users, Target, Lightbulb, TrendingUp, Bot, HelpCircle } from 'lucide-react';
import type { MetaAudience } from '../types/meta';
import { OpenAIService } from '../services/openai';
import { useAIChatStore } from '../store/aiChatStore';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
    setIsVisible(true);
  };

  return (
    <div className="relative inline-flex items-center">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full"
          style={{
            top: `${position.y - 8}px`,
            left: `${position.x}px`
          }}
        >
          <div className="bg-gray-900 text-white text-sm rounded-lg py-2 px-3 max-w-xs shadow-lg">
            {content}
            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
};

interface InterestAnalysisProps {
  selectedInterests: MetaAudience[];
}

export const InterestAnalysis: React.FC<InterestAnalysisProps> = ({
  selectedInterests
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addMessage = useAIChatStore(state => state.addMessage);

  if (selectedInterests.length === 0) {
    return null;
  }

  const getTotalReach = (interests: MetaAudience[]): number => {
    return interests.reduce((sum, interest) => sum + (interest.estimatedReach || 0), 0);
  };

  const getEstimatedOverlap = (interests: MetaAudience[]): number => {
    if (interests.length < 2) return 0;
    const totalReach = getTotalReach(interests);
    const overlapPercentage = Math.min(0.3 * interests.length, 0.7);
    return Math.floor(totalReach * overlapPercentage);
  };

  const generateAnalysisPrompt = () => {
    const interestNames = selectedInterests.map(i => i.name).join(', ');
    const totalReach = getTotalReach(selectedInterests);
    const overlap = getEstimatedOverlap(selectedInterests);
    
    return `Analyze these Meta Ads targeting interests: ${interestNames}

Key metrics:
- Total estimated reach: ${totalReach}
- Audience overlap: ${overlap}
- Number of interests: ${selectedInterests.length}

Please provide:
1. Analysis of how these interests work together
2. Potential audience characteristics
3. Targeting recommendations
4. Budget optimization suggestions
5. Creative strategy tips`;
  };

  const handleChatAnalysis = async () => {
    if (isLoading || selectedInterests.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const prompt = generateAnalysisPrompt();
      
      addMessage({ 
        role: 'user', 
        content: `Please analyze these interests: ${selectedInterests.map(i => i.name).join(', ')}`
      });
      
      const response = await OpenAIService.generateResponse(prompt);
      addMessage({ role: 'assistant', content: response });
    } catch (err) {
      console.error('AI analysis error:', err);
      setError('Failed to generate analysis. Please try again.');
      
      addMessage({ 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error while analyzing the interests. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">Interest Analysis</h3>
            <Tooltip content="Analysis of your selected interests showing potential reach, audience overlap, and targeting effectiveness">
              <HelpCircle size={16} className="text-gray-400" />
            </Tooltip>
          </div>
          <div className="flex items-center gap-4">
            <Tooltip content="Get detailed AI-powered analysis and recommendations for your selected interests">
              <button
                onClick={handleChatAnalysis}
                disabled={isLoading || selectedInterests.length === 0}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isLoading || selectedInterests.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Bot size={18} />
                {isLoading ? 'Analyzing...' : 'Ask AI Assistant'}
              </button>
            </Tooltip>
            <span className="text-sm text-gray-500">
              {selectedInterests.length} interests selected
            </span>
          </div>
        </div>
        
        {error && (
          <div className="mt-2 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* Collapsible Content */}
      <div className={`overflow-hidden transition-all duration-200 ${
        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-blue-600" />
                <h4 className="font-medium text-blue-700">Total Reach</h4>
                <Tooltip content="The total number of people who could potentially see your ad based on the selected interests. This is the combined audience size without considering overlap.">
                  <HelpCircle size={16} className="text-blue-400" />
                </Tooltip>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {new Intl.NumberFormat('en-US', { notation: 'compact' }).format(getTotalReach(selectedInterests))}
              </p>
              <p className="text-sm text-blue-600 mt-1">Combined audience size</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Target size={20} className="text-green-600" />
                <h4 className="font-medium text-green-700">Overlap</h4>
                <Tooltip content="Estimated number of people who match multiple selected interests. High overlap can mean a more targeted audience but may increase ad costs.">
                  <HelpCircle size={16} className="text-green-400" />
                </Tooltip>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {new Intl.NumberFormat('en-US', { notation: 'compact' }).format(getEstimatedOverlap(selectedInterests))}
              </p>
              <p className="text-sm text-green-600 mt-1">Estimated shared audience</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Lightbulb size={20} className="text-purple-600" />
                <h4 className="font-medium text-purple-700">Potential</h4>
                <Tooltip content="Overall targeting effectiveness based on audience size, overlap, and interest compatibility. Higher potential suggests better ad performance.">
                  <HelpCircle size={16} className="text-purple-400" />
                </Tooltip>
              </div>
              <p className="text-2xl font-bold text-purple-700">
                {selectedInterests.length > 1 ? 'High' : 'Moderate'}
              </p>
              <p className="text-sm text-purple-600 mt-1">Targeting effectiveness</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};