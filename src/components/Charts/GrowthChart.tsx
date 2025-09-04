/**
 * Growth chart component using Recharts
 */
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ChartDataPoint } from '@/types';

interface GrowthChartProps {
  data: ChartDataPoint[];
  title?: string;
  color?: string;
  type?: 'line' | 'area';
  height?: number;
  loading?: boolean;
  className?: string;
}

function GrowthChart({
  data,
  title,
  color = '#f054ff',
  type = 'area',
  height = 300,
  loading = false,
  className = '',
}: GrowthChartProps) {
  const formatXAxisDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, 'MMM dd');
    } catch {
      return dateStr;
    }
  };

  const formatTooltipDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  if (loading) {
    return (
      <div className={`card p-6 ${className}`}>
        {title && (
          <div className="loading-pulse h-6 w-48 rounded mb-4"></div>
        )}
        <div className="loading-pulse w-full rounded" style={{ height }}>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`card p-6 ${className}`}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <div 
          className="flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg"
          style={{ height }}
        >
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {formatTooltipDate(label)}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium" style={{ color }}>
              {formatValue(payload[0].value)}
            </span>
            {payload[0].payload.label && (
              <span className="ml-1">
                {payload[0].payload.label}
              </span>
            )}
          </p>
        </div>
      );
    }
    return null;
  };

  const ChartComponent = type === 'area' ? AreaChart : LineChart;

  return (
    <div className={`card p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxisDate}
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tickFormatter={formatValue}
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {type === 'area' ? (
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`${color}20`}
              fillOpacity={0.6}
            />
          ) : (
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: '#fff' }}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}

export default GrowthChart;
