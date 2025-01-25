import React, { useState } from 'react';
import { Users, ChevronDown, ChevronUp, Filter, Share2, Download, Plus, DollarSign, TrendingUp, Bot, HelpCircle } from 'lucide-react';
import type { MetaAudience } from '../types/meta';
import { InterestAnalysis } from './InterestAnalysis';
import { AIChatbot } from './AIChatbot';

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
      y: rect.top - 10 // Offset to prevent flickering
    });
    setIsVisible(true);
  };

  return (
    <div className="relative inline-flex items-center group">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div
          className="fixed z-[9999] transform -translate-x-1/2"
          style={{
            top: `${position.y}px`,
            left: `${position.x}px`,
            pointerEvents: 'none'
          }}
        >
          <div className="relative -top-full">
            <div className="bg-gray-900 text-white text-sm rounded-lg py-2 px-3 max-w-xs shadow-lg mb-2">
              {content}
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
};

interface AudienceResultsProps {
  audiences: MetaAudience[];
  activeFilters: Record<string, string>;
}

export const AudienceResults: React.FC<AudienceResultsProps> = ({ audiences, activeFilters }) => {
  const [sortField, setSortField] = useState<'size' | 'estimatedReach'>('size');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedInterests, setSelectedInterests] = useState<MetaAudience[]>([]);

  if (audiences.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200/50">
        <div className="max-w-md mx-auto">
          <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No audiences found</h3>
          <p className="text-gray-500">
            Try adjusting your search terms or filters to find relevant audiences.
          </p>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    return `${(num / 1000).toFixed(1)}K`;
  };

  const calculateEstimatedReach = (audience: MetaAudience): number => {
    const budget = parseInt(activeFilters.budget || '10', 10);
    const baseCPM = 3.5;
    const targetingMultiplier = audience.targeting?.interests?.length ? 1.2 : 1;
    const adjustedCPM = baseCPM * targetingMultiplier;
    const potentialImpressions = (budget * 1000) / adjustedCPM;
    const reachRate = 0.7;
    return Math.min(Math.floor(potentialImpressions * reachRate), audience.size);
  };

  const sortedAudiences = [...audiences].sort((a, b) => {
    const aValue = sortField === 'size' ? a.size : calculateEstimatedReach(a);
    const bValue = sortField === 'size' ? b.size : calculateEstimatedReach(b);
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const toggleSort = (field: 'size' | 'estimatedReach') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleRowExpansion = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    expandedRows.has(id) ? newExpandedRows.delete(id) : newExpandedRows.add(id);
    setExpandedRows(newExpandedRows);
  };

  const toggleInterestSelection = (interest: MetaAudience) => {
    setSelectedInterests(prev => 
      prev.some(i => i.id === interest.id)
        ? prev.filter(i => i.id !== interest.id)
        : [...prev, interest]
    );
  };

  return (
    <div className="space-y-6">
      {selectedInterests.length > 0 && (
        <InterestAnalysis selectedInterests={selectedInterests} />
      )}

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden">
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-medium text-gray-900">Results</h3>
              <span className="text-sm text-gray-500">({audiences.length} audiences)</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-secondary">
                <Share2 size={18} className="text-gray-600" />
              </button>
              <button className="btn-secondary">
                <Download size={18} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/50 bg-gray-50/50">
                <th className="py-4 px-6 text-left font-medium text-gray-600">
                  <Tooltip content="Select interests to analyze them together and get AI-powered recommendations">
                    <div className="flex items-center gap-2">
                      <span>Select</span>
                      <HelpCircle size={14} className="text-gray-400" />
                    </div>
                  </Tooltip>
                </th>
                <th className="py-4 px-6 text-left font-medium text-gray-600">
                  <Tooltip content="The name of the interest and any related targeting criteria">
                    <div className="flex items-center gap-2">
                      <span>Name</span>
                      <HelpCircle size={14} className="text-gray-400" />
                    </div>
                  </Tooltip>
                </th>
                <th className="py-4 px-6 text-left font-medium text-gray-600">
                  <Tooltip content="Total number of monthly active users who match this interest">
                    <button 
                      onClick={() => toggleSort('size')}
                      className="flex items-center gap-2 hover:text-gray-900"
                    >
                      <span>Audience Size</span>
                      <HelpCircle size={14} className="text-gray-400" />
                      {sortField === 'size' && (
                        sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </button>
                  </Tooltip>
                </th>
                <th className="py-4 px-6 text-left font-medium text-gray-600">
                  <Tooltip content="Estimated number of people you can reach with your current budget and targeting settings">
                    <button 
                      onClick={() => toggleSort('estimatedReach')}
                      className="flex items-center gap-2 hover:text-gray-900"
                    >
                      <span>Est. Reach</span>
                      <HelpCircle size={14} className="text-gray-400" />
                      {sortField === 'estimatedReach' && (
                        sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </button>
                  </Tooltip>
                </th>
                <th className="py-4 px-6 text-left font-medium text-gray-600">
                  <Tooltip content="The broader category or topic this interest belongs to">
                    <div className="flex items-center gap-2">
                      <span>Category</span>
                      <HelpCircle size={14} className="text-gray-400" />
                    </div>
                  </Tooltip>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedAudiences.map((audience) => (
                <React.Fragment key={audience.id}>
                  <tr 
                    className={`border-b border-gray-200/50 hover:bg-blue-50/5 transition-colors ${
                      expandedRows.has(audience.id) ? 'bg-blue-50/10' : ''
                    }`}
                  >
                    <td className="py-4 px-6">
                      <button
                        onClick={() => toggleInterestSelection(audience)}
                        className={`p-2 rounded-lg transition-colors ${
                          selectedInterests.some(i => i.id === audience.id)
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        <Plus size={16} />
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => toggleRowExpansion(audience.id)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <span className="font-medium">{audience.name}</span>
                        {expandedRows.has(audience.id) ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                      {audience.targeting?.interests && (
                        <div className="mt-1 text-sm text-gray-500">
                          {audience.targeting.interests.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-blue-600" />
                        <span className="font-medium">{formatNumber(audience.size)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-green-600" />
                        <span className="font-medium">
                          {formatNumber(calculateEstimatedReach(audience))}
                        </span>
                        <span className="text-sm text-gray-500">
                          (USD {activeFilters.budget || '10'})
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {audience.path || '-'}
                    </td>
                  </tr>
                  {expandedRows.has(audience.id) && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={5} className="p-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-4">Audience Details</h4>
                            <p className="text-gray-600 mb-4">
                              {audience.description || 'No description available'}
                            </p>
                            <div className="space-y-4">
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Demographics</h5>
                                <div className="grid grid-cols-2 gap-3">
                                  {audience.demographics?.map((demo, index) => (
                                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                                      <div className="text-sm font-medium text-gray-900">{demo.type}</div>
                                      <div className="text-sm text-gray-600 mt-1">{demo.value}</div>
                                      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-blue-600 rounded-full"
                                          style={{ width: `${demo.percentage * 100}%` }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Estimated Performance</h5>
                                <div className="space-y-2">
                                  {[10, 20, 50, 100].map(budget => (
                                    <div key={budget} className="flex items-center gap-2">
                                      <DollarSign size={14} className="text-green-600" />
                                      <span className="text-sm text-gray-600">
                                        USD {budget}: {formatNumber(calculateEstimatedReach(audience))} reach
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-4">Behaviors</h4>
                            <div className="space-y-3">
                              {audience.behaviors?.map((behavior, index) => (
                                <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                                  <div className="text-sm font-medium text-gray-900">{behavior.name}</div>
                                  <div className="text-sm text-gray-600 mt-1">{behavior.category}</div>
                                  <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-green-600 rounded-full"
                                        style={{ width: `${behavior.percentage * 100}%` }}
                                      />
                                    </div>
                                    <span className="text-sm text-gray-600">
                                      {(behavior.percentage * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AIChatbot onInterestsGenerated={() => {}} />
    </div>
  );
};