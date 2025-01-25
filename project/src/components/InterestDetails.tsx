import React, { useState, useEffect } from 'react';
import { MetaApiService } from '../services/metaApi';
import { useAuthStore } from '../store/authStore';
import { Loader2, Users, TrendingUp, BookOpen, Target, AlertTriangle } from 'lucide-react';

interface InterestDetailsProps {
  interestId: string;
  onClose: () => void;
  onRelatedInterestClick: (interest: any) => void;
}

export const InterestDetails: React.FC<InterestDetailsProps> = ({
  interestId,
  onClose,
  onRelatedInterestClick
}) => {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const accessToken = useAuthStore(state => state.accessToken);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const metaApi = new MetaApiService(accessToken!);
        const data = await metaApi.getInterestDetails(interestId);
        setDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load interest details');
      } finally {
        setLoading(false);
      }
    };

    if (interestId && accessToken) {
      fetchDetails();
    }
  }, [interestId, accessToken]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading interest details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4">
          <div className="flex items-center text-red-600 mb-4">
            <AlertTriangle className="w-6 h-6" />
            <span className="ml-2 font-medium">Error</span>
          </div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={onClose}
            className="mt-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!details) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{details.name}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <Users className="w-5 h-5" />
                <h3 className="font-medium">Audience Size</h3>
              </div>
              <p className="text-2xl font-bold text-blue-700 mt-2">
                {new Intl.NumberFormat('en-US', { notation: 'compact' }).format(details.size)}
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-700">
                <Target className="w-5 h-5" />
                <h3 className="font-medium">Category</h3>
              </div>
              <p className="text-lg font-medium text-green-700 mt-2">
                {details.path || 'General'}
              </p>
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-700">
                <TrendingUp className="w-5 h-5" />
                <h3 className="font-medium">Growth Trend</h3>
              </div>
              <p className="text-lg font-medium text-purple-700 mt-2">
                {details.distribution?.trend || 'Stable'}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Demographics */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Demographics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(details.demographics).map(([category, data]: [string, any]) => (
                  <div key={category} className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-700 capitalize mb-3">{category}</h4>
                    <div className="space-y-2">
                      {data.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{item.label}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {(item.percentage * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Interests */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Related Interests</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {details.relatedInterests.map((interest: any) => (
                  <button
                    key={interest.id}
                    onClick={() => onRelatedInterestClick(interest)}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <div className="text-left">
                        <div className="font-medium text-gray-900 group-hover:text-blue-600">
                          {interest.name}
                        </div>
                        <div className="text-sm text-gray-500">{interest.path}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Intl.NumberFormat('en-US', { notation: 'compact' }).format(interest.size)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Behaviors */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Behavioral Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {details.behaviors.map((category: any, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-700 mb-3">{category.category}</h4>
                    <div className="space-y-3">
                      {category.behaviors.map((behavior: any, bIndex: number) => (
                        <div key={bIndex}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{behavior.name}</span>
                            <span className="font-medium text-gray-900">
                              {(behavior.percentage * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${behavior.percentage * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};