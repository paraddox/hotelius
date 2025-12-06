'use client';

import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  format?: 'currency' | 'percentage' | 'number';
  sparklineData?: number[];
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  previousValue,
  format = 'number',
  sparklineData,
  icon,
  className,
}: MetricCardProps) {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  // Calculate percentage change
  let changePercent = 0;
  let changeDirection: 'up' | 'down' | 'neutral' = 'neutral';

  if (previousValue !== undefined && previousValue !== 0) {
    changePercent = ((numericValue - previousValue) / previousValue) * 100;
    if (changePercent > 0.1) changeDirection = 'up';
    else if (changePercent < -0.1) changeDirection = 'down';
    else changeDirection = 'neutral';
  }

  const formatValue = (val: number): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'number':
      default:
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(val);
    }
  };

  return (
    <Card className={cn('hover:shadow-lg transition-shadow duration-200', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-2">
              {title}
            </p>
            <p className="font-['Cormorant_Garamond',Georgia,serif] text-3xl font-semibold text-[#2C2C2C]">
              {formatValue(numericValue)}
            </p>
          </div>
          {icon && (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F0EBE3] text-[#C4A484]">
              {icon}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          {previousValue !== undefined && (
            <div className="flex items-center gap-1.5">
              {changeDirection === 'up' && (
                <div className="flex items-center gap-1 text-sm font-medium text-[#5AAF5A]">
                  <ArrowUp className="w-4 h-4" />
                  <span>{Math.abs(changePercent).toFixed(1)}%</span>
                </div>
              )}
              {changeDirection === 'down' && (
                <div className="flex items-center gap-1 text-sm font-medium text-[#C45C5C]">
                  <ArrowDown className="w-4 h-4" />
                  <span>{Math.abs(changePercent).toFixed(1)}%</span>
                </div>
              )}
              {changeDirection === 'neutral' && (
                <div className="flex items-center gap-1 text-sm font-medium text-[#8B8B8B]">
                  <Minus className="w-4 h-4" />
                  <span>No change</span>
                </div>
              )}
              <span className="text-xs text-[#8B8B8B] ml-1">vs previous period</span>
            </div>
          )}

          {sparklineData && sparklineData.length > 0 && (
            <div className="ml-auto">
              <Sparkline data={sparklineData} color="#C4A484" width={80} height={30} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Simple SVG sparkline component
interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

function Sparkline({ data, color = '#C4A484', width = 80, height = 30 }: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  // Create area path
  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Area under the line */}
      <polygon
        points={areaPoints}
        fill={color}
        fillOpacity="0.1"
        stroke="none"
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last point indicator */}
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="3"
        fill={color}
        stroke="white"
        strokeWidth="2"
      />
    </svg>
  );
}
