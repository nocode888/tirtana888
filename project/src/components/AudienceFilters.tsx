import React, { useState } from 'react';
import { Filter, X, ChevronDown, Users, Calendar, DollarSign } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterGroup {
  name: string;
  options: FilterOption[];
}

const filterGroups: FilterGroup[] = [
  {
    name: 'gender',
    options: [
      { label: 'All Genders', value: 'all' },
      { label: 'Female', value: 'female' },
      { label: 'Male', value: 'male' }
    ]
  },
  {
    name: 'age',
    options: [
      { label: '13 - 17', value: '13-17' },
      { label: '18 - 24', value: '18-24' },
      { label: '25 - 34', value: '25-34' },
      { label: '35 - 44', value: '35-44' },
      { label: '45 - 54', value: '45-54' },
      { label: '55 - 64', value: '55-64' },
      { label: '65+', value: '65-99' }
    ]
  },
  {
    name: 'objective',
    options: [
      { label: 'Awareness', value: 'AWARENESS' },
      { label: 'Conversions', value: 'CONVERSIONS' },
      { label: 'Traffic', value: 'TRAFFIC' },
      { label: 'Engagement', value: 'ENGAGEMENT' },
      { label: 'App Promotion', value: 'APP_PROMOTION' },
      { label: 'Lead Generation', value: 'LEAD_GENERATION' }
    ]
  },
  {
    name: 'budget',
    options: [
      { label: 'USD 5', value: '5' },
      { label: 'USD 10', value: '10' },
      { label: 'USD 20', value: '20' },
      { label: 'USD 50', value: '50' },
      { label: 'USD 100', value: '100' }
    ]
  },
  {
    name: 'placement',
    options: [
      { label: 'Automatic', value: 'automatic' },
      { label: 'Facebook', value: 'facebook' },
      { label: 'Instagram', value: 'instagram' },
      { label: 'Messenger', value: 'messenger' },
      { label: 'WhatsApp', value: 'whatsapp' }
    ]
  }
];

interface AudienceFiltersProps {
  onFiltersChange: (filters: Record<string, string>) => void;
}

export const AudienceFilters: React.FC<AudienceFiltersProps> = ({ onFiltersChange }) => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
    gender: 'all',
    age: '18-24',
    budget: '10',
    objective: 'CONVERSIONS',
    placement: 'automatic'
  });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleFilterChange = (group: string, value: string) => {
    const newFilters = {
      ...activeFilters,
      [group]: value
    };
    setActiveFilters(newFilters);
    setOpenDropdown(null);
    onFiltersChange(newFilters);
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...activeFilters };
    if (key === 'gender') {
      newFilters.gender = 'all';
    } else if (key === 'age') {
      newFilters.age = '18-24'; // Default age range
    } else if (key === 'budget') {
      newFilters.budget = '10'; // Default budget
    } else {
      delete newFilters[key];
    }
    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const getDisplayValue = (group: string, value: string): string => {
    const option = filterGroups.find(g => g.name === group)?.options.find(o => o.value === value);
    return option?.label || value;
  };

  const getFilterIcon = (key: string) => {
    switch (key) {
      case 'gender':
        return <Users size={14} />;
      case 'age':
        return <Calendar size={14} />;
      case 'budget':
        return <DollarSign size={14} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-600" />
          <h3 className="font-medium text-gray-800">Active Filters</h3>
        </div>
        <button 
          onClick={() => {
            const defaultFilters = {
              gender: 'all',
              age: '18-24',
              budget: '10',
              objective: 'CONVERSIONS',
              placement: 'automatic'
            };
            setActiveFilters(defaultFilters);
            onFiltersChange(defaultFilters);
          }}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Reset to Default
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {Object.entries(activeFilters).map(([key, value]) => (
          <div key={key} className="relative">
            <div 
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-sm hover:bg-gray-100 transition-colors cursor-pointer ${
                (key === 'gender' && value !== 'all') || (key === 'age') || (key === 'budget')
                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  : 'bg-gray-50 text-gray-700'
              }`}
              onClick={() => setOpenDropdown(openDropdown === key ? null : key)}
            >
              {getFilterIcon(key)}
              <span className="text-gray-500 capitalize">{key}:</span>
              <span className="font-medium text-current">{getDisplayValue(key, value)}</span>
              <ChevronDown size={14} className={`text-current transition-transform ${openDropdown === key ? 'rotate-180' : ''}`} />
              {key !== 'gender' && key !== 'age' && key !== 'budget' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFilter(key);
                  }}
                  className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {openDropdown === key && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                {filterGroups.find(group => group.name === key)?.options.map(option => (
                  <button
                    key={option.value}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      activeFilters[key] === option.value 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700'
                    }`}
                    onClick={() => handleFilterChange(key, option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};