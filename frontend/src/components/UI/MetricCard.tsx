/**
 * Metric card component for displaying key statistics
 */
import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/solid';
import { MetricCardProps } from '@/types';

function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  loading = false,
  className = '',
}: MetricCardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  const getChangeIcon = () => {
    if (!change) return null;
    
    if (change > 0) {
      return <ArrowUpIcon className="w-4 h-4 text-success-600" />;
    } else if (change < 0) {
      return <ArrowDownIcon className="w-4 h-4 text-error-600" />;
    } else {
      return <MinusIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getChangeColor = () => {
    if (!change) return 'text-gray-500';
    
    if (change > 0) {
      return 'text-success-600';
    } else if (change < 0) {
      return 'text-error-600';
    } else {
      return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className={`metric-card ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="loading-pulse h-4 w-24 rounded"></div>
          {Icon && (
            <div className="loading-pulse w-8 h-8 rounded-lg"></div>
          )}
        </div>
        <div className="loading-pulse h-8 w-32 rounded mb-2"></div>
        <div className="loading-pulse h-4 w-20 rounded"></div>
      </div>
    );
  }

  return (
    <div className={`metric-card hover:shadow-md transition-all duration-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="metric-label">{title}</h3>
        {Icon && (
          <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg">
            <Icon className="w-4 h-4 text-primary-600" />
          </div>
        )}
      </div>
      
      <div className="metric-value mb-2">
        {formatValue(value)}
      </div>
      
      {(change !== undefined || changeLabel) && (
        <div className="flex items-center space-x-1">
          {getChangeIcon()}
          <span className={`text-sm font-medium ${getChangeColor()}`}>
            {change !== undefined && (
              <>
                {change > 0 ? '+' : ''}
                {change}%
              </>
            )}
            {changeLabel && (
              <span className="text-gray-500 ml-1">
                {changeLabel}
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

export default MetricCard;
