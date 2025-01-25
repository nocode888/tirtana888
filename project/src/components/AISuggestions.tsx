import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, Bot } from 'lucide-react';
import { OpenAIService } from '../services/openai';

interface AISuggestionsProps {
  currentInterests: string[];
  onSuggestionClick: (interest: string) => void;
}

export const AISuggestions: React.FC<AISuggestionsProps> = ({
  currentInterests,
  onSuggestionClick,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestions = async () => {
    if (currentInterests.length === 0) {
      setError('Please add at least one interest first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newSuggestions = await OpenAIService.generateInterestSuggestions(
        currentInterests
      );
      setSuggestions(newSuggestions);
    } catch (err) {
      setError('Failed to generate suggestions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={generateSuggestions}
          disabled={loading || currentInterests.length === 0}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            loading || currentInterests.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
          }`}
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Bot size={18} />
          )}
          {loading ? 'Generating...' : 'Get AI Suggestions'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Sparkles size={16} className="text-purple-600" />
            AI-Generated Suggestions:
          </h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onSuggestionClick(suggestion)}
                className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm hover:bg-purple-100 transition-colors flex items-center gap-1.5"
              >
                <span>{suggestion}</span>
                <span className="text-purple-400">+</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};