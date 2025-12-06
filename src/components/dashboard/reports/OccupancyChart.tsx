'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { OccupancyDataPoint } from '@/lib/api/reports';
import { EmptyState } from '@/components/ui/EmptyState';
import { BarChart3 } from 'lucide-react';

interface OccupancyChartProps {
  data: OccupancyDataPoint[];
  title?: string;
}

export function OccupancyChart({ data, title = 'Occupancy Rate Over Time' }: OccupancyChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<BarChart3 className="w-6 h-6" />}
            title="No occupancy data available"
            description="There is no occupancy data for the selected period."
          />
        </CardContent>
      </Card>
    );
  }

  const maxOccupancy = Math.max(...data.map(d => d.occupancy), 100);
  const chartHeight = 300;
  const chartWidth = 600;
  const padding = { top: 20, right: 20, bottom: 60, left: 50 };

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const barWidth = Math.min(innerWidth / data.length - 8, 40);
  const barSpacing = (innerWidth - barWidth * data.length) / (data.length + 1);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Y-axis ticks
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full"
            style={{ minWidth: '600px' }}
          >
            {/* Y-axis grid lines and labels */}
            {yTicks.map(tick => {
              const y = padding.top + innerHeight - (tick / 100) * innerHeight;
              return (
                <g key={tick}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#E8E0D5"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 10}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="text-xs fill-[#8B8B8B]"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {tick}%
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {data.map((point, index) => {
              const x = padding.left + barSpacing + index * (barWidth + barSpacing);
              const barHeight = (point.occupancy / 100) * innerHeight;
              const y = padding.top + innerHeight - barHeight;

              const fillColor = point.occupancy >= 80
                ? '#5AAF5A'
                : point.occupancy >= 50
                ? '#C4A484'
                : '#C45C5C';

              return (
                <g key={point.date}>
                  {/* Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={fillColor}
                    rx="4"
                    className="transition-opacity hover:opacity-80 cursor-pointer"
                  >
                    <title>
                      {formatDate(point.date)}: {point.occupancy.toFixed(1)}% ({point.booked}/{point.available} rooms)
                    </title>
                  </rect>

                  {/* X-axis label */}
                  {(data.length <= 14 || index % Math.ceil(data.length / 14) === 0) && (
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight - padding.bottom + 20}
                      textAnchor="middle"
                      className="text-xs fill-[#8B8B8B]"
                      style={{ fontFamily: 'DM Sans, sans-serif' }}
                    >
                      {formatDate(point.date)}
                    </text>
                  )}
                </g>
              );
            })}

            {/* X-axis */}
            <line
              x1={padding.left}
              y1={chartHeight - padding.bottom}
              x2={chartWidth - padding.right}
              y2={chartHeight - padding.bottom}
              stroke="#2C2C2C"
              strokeWidth="2"
            />

            {/* Y-axis */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={chartHeight - padding.bottom}
              stroke="#2C2C2C"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#5AAF5A]" />
            <span className="text-sm text-[#8B8B8B]">High (&ge; 80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#C4A484]" />
            <span className="text-sm text-[#8B8B8B]">Medium (50-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#C45C5C]" />
            <span className="text-sm text-[#8B8B8B]">Low (&lt; 50%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
