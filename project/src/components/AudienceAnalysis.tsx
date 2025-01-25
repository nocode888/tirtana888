import React from 'react';
import { BarChart3, Users, Target, Lightbulb, TrendingUp } from 'lucide-react';
import type { MetaAudience } from '../types/meta';
import { AudienceAnalyzer } from '../services/audienceAnalyzer';

interface AudienceAnalysisProps {
  businessDescription: string;
  audiences: MetaAudience[];
}

export const AudienceAnalysis: React.FC<AudienceAnalysisProps> = ({
  businessDescription,
  audiences
}) => {
  const analysis = AudienceAnalyzer.analyzeBusinessType(businessDescription, audiences);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    return `${(num / 1000).toFixed(1)}K`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-500 p-4">
        <h2 className="text-lg font-semibold text-white">Audience Analysis</h2>
        <p className="text-blue-100 text-sm mt-1">
          Detailed targeting recommendations based on your business profile
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Target size={20} />
              <h3 className="font-medium">Primary Interests</h3>
            </div>
            <div className="space-y-1">
              {analysis.primaryInterests.map((interest, i) => (
                <div key={i} className="text-sm text-blue-700">{interest}</div>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Users size={20} />
              <h3 className="font-medium">Market Size</h3>
            </div>
            <p className="text-2xl font-bold text-purple-700">
              {formatNumber(analysis.marketSize)}
            </p>
            <p className="text-sm text-purple-600 mt-1">Total potential reach</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <TrendingUp size={20} />
              <h3 className="font-medium">Engagement Potential</h3>
            </div>
            <p className="text-2xl font-bold text-green-700">High</p>
            <p className="text-sm text-green-600 mt-1">Based on audience overlap</p>
          </div>
        </div>

        {/* Demographics */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Target Demographics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analysis.demographics).map(([key, values]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 capitalize mb-2">{key}</h4>
                <div className="space-y-1">
                  {values.map((value, i) => (
                    <div key={i} className="text-sm text-gray-600">{value}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Behaviors */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Behavioral Patterns</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.behaviors.map((behavior, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">{behavior.category}</h4>
                <div className="flex flex-wrap gap-2">
                  {behavior.items.map((item, i) => (
                    <span key={i} className="px-2 py-1 bg-white rounded text-sm text-gray-600">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Strategic Recommendations</h3>
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
            <div className="flex gap-3">
              <Lightbulb className="text-yellow-600 flex-shrink-0" size={24} />
              <div className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <p key={index} className="text-sm text-yellow-800">• {rec}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Targeting Rationale */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Targeting Rationale</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {analysis.rationale}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};