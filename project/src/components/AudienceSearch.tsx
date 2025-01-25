import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, History, Bot, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { MetaApiService } from '../services/metaApi';
import { AISuggestions } from './AISuggestions';

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export const AudienceSearch: React.FC<{
  onSearchResults: (results: any[]) => void;
  activeFilters: Record<string, string>;
}> = ({ onSearchResults, activeFilters }) => {
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (!query.trim() || !accessToken) return;

      setIsLoadingSuggestions(true);
      try {
        const metaApi = new MetaApiService(accessToken);
        const results = await metaApi.searchAudiences(query, activeFilters);
        
        // Extract unique interest names
        const interestNames = Array.from(new Set(
          results.map(result => result.name)
        )).slice(0, 10); // Limit to top 10 suggestions
        
        setSuggestions(interestNames);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300),
    [accessToken, activeFilters]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    if (value.trim().length > 0) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleInputFocus = () => {
    if (searchInput.trim().length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!searchTerms.includes(suggestion)) {
      const newTerms = [...searchTerms, suggestion];
      setSearchTerms(newTerms);
      setSearchInput('');
      setSuggestions([]);
      setShowSuggestions(false);
      debouncedSearch(newTerms, activeFilters);
    }
  };

  const performSearch = async (terms: string[], filters: Record<string, string>) => {
    if (!accessToken) {
      setError('Please connect your Meta account first');
      return;
    }

    if (terms.length === 0 && !searchInput.trim()) {
      setError('Please enter at least one search term');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const metaApi = new MetaApiService(accessToken);
      const searchTermsToUse = terms.length > 0 ? terms : [searchInput.trim()];
      
      const results = await Promise.all(
        searchTermsToUse.map(term => metaApi.searchAudiences(term, filters))
      );
      
      const flatResults = Array.from(new Set(
        results.flat().map(r => JSON.stringify(r))
      )).map(r => JSON.parse(r));
      
      if (flatResults.length === 0) {
        setError(`No results found for "${searchTermsToUse.join(', ')}". Try:
          • Using more general terms
          • Checking for spelling mistakes
          • Removing some filters
          • Trying related terms from the suggestions below`);
      }
      
      onSearchResults(flatResults);
    } catch (err) {
      console.error('Search error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to search interests';
      setError(`${errorMessage}. Please try again or use different search terms.`);
      onSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((terms: string[], filters: Record<string, string>) => {
      performSearch(terms, filters);
    }, 500),
    [accessToken, onSearchResults]
  );

  useEffect(() => {
    if (searchTerms.length > 0) {
      debouncedSearch(searchTerms, activeFilters);
    }
  }, [activeFilters, searchTerms, debouncedSearch]);

  const handleAddTerm = () => {
    const term = searchInput.trim();
    if (term && !searchTerms.includes(term)) {
      const newTerms = [...searchTerms, term];
      setSearchTerms(newTerms);
      setSearchInput('');
      setSuggestions([]);
      setShowSuggestions(false);
      debouncedSearch(newTerms, activeFilters);
    }
  };

  const handleRemoveTerm = (term: string) => {
    const newTerms = searchTerms.filter(t => t !== term);
    setSearchTerms(newTerms);
    if (newTerms.length > 0) {
      debouncedSearch(newTerms, activeFilters);
    } else {
      onSearchResults([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey || e.ctrlKey) {
        handleSearch();
      } else {
        handleAddTerm();
      }
    }
  };

  const handleSearch = () => {
    const terms = searchTerms.length > 0 ? searchTerms : [searchInput.trim()];
    if (terms.length === 0 || (terms.length === 1 && !terms[0])) {
      setError('Please enter a search term');
      return;
    }
    performSearch(terms, activeFilters);
  };

  const handleAISuggestionClick = (suggestion: string) => {
    if (!searchTerms.includes(suggestion)) {
      const newTerms = [...searchTerms, suggestion];
      setSearchTerms(newTerms);
      debouncedSearch(newTerms, activeFilters);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 flex-wrap">
          {searchTerms.map((term) => (
            <span
              key={term}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-1 hover:bg-blue-100 transition-colors"
            >
              {term}
              <button
                onClick={() => handleRemoveTerm(term)}
                className="text-blue-400 hover:text-blue-600 ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <div ref={searchContainerRef} className="relative flex-1">
            <input
              ref={searchInputRef}
              type="text"
              value={searchInput}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyPress={handleKeyPress}
              placeholder="Search interests, behaviors, demographics... (Press Enter to add)"
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />

            {/* Live suggestions dropdown */}
            {showSuggestions && (
              <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[300px] overflow-y-auto">
                {isLoadingSuggestions ? (
                  <div className="p-4 text-center text-gray-500">
                    Loading suggestions...
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 text-gray-700 first:rounded-t-lg last:rounded-b-lg flex items-center justify-between group"
                    >
                      <span>{suggestion}</span>
                      <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        Add
                      </span>
                    </button>
                  ))
                ) : searchInput.trim().length > 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No matching interests found
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="whitespace-pre-line">{error}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
          <button 
            onClick={handleSearch}
            disabled={isSearching || (searchTerms.length === 0 && !searchInput.trim())}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isSearching || (searchTerms.length === 0 && !searchInput.trim())
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Search size={18} />
            {isSearching ? 'Searching...' : 'Search'}
          </button>
          <button 
            onClick={handleAddTerm}
            disabled={!searchInput.trim()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
              !searchInput.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Plus size={18} />
            Add Interest
          </button>
          <button
            onClick={() => handleAISuggestionClick(searchInput)}
            disabled={searchTerms.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchTerms.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            <Bot size={18} />
            Get AI Suggestions
          </button>
        </div>
      </div>

      {searchTerms.length > 0 && (
        <AISuggestions
          currentInterests={searchTerms}
          onSuggestionClick={handleAISuggestionClick}
        />
      )}
    </div>
  );
};