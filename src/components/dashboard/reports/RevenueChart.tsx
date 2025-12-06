'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { RevenueByRoomType } from '@/lib/api/reports';
import { EmptyState } from '@/components/ui/EmptyState';
import { DollarSign } from 'lucide-react';

interface RevenueChartProps {
  data: RevenueByRoomType[];
  title?: string;
}

export function RevenueChart({ data, title = 'Revenue by Room Type' }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<DollarSign className="w-6 h-6" />}
            title="No revenue data available"
            description="There is no revenue data for the selected period."
          />
        </CardContent>
      </Card>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const chartHeight = 300;
  const chartWidth = 600;
  const padding = { top: 20, right: 20, bottom: 80, left: 80 };

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const barWidth = Math.min(innerWidth / data.length - 16, 60);
  const barSpacing = (innerWidth - barWidth * data.length) / (data.length + 1);

  // Calculate Y-axis scale
  const roundToNiceNumber = (num: number) => {
    const magnitude = Math.pow(10, Math.floor(Math.log10(num)));
    const normalized = num / magnitude;
    const nice = normalized < 2 ? 2 : normalized < 5 ? 5 : 10;
    return nice * magnitude;
  };

  const yMax = roundToNiceNumber(maxRevenue * 1.1);
  const yStep = yMax / 4;
  const yTicks = [0, yStep, yStep * 2, yStep * 3, yStep * 4];

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value.toFixed(0)}`;
  };

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
              const y = padding.top + innerHeight - (tick / yMax) * innerHeight;
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
                    {formatCurrency(tick)}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {data.map((item, index) => {
              const x = padding.left + barSpacing + index * (barWidth + barSpacing);
              const barHeight = (item.revenue / yMax) * innerHeight;
              const y = padding.top + innerHeight - barHeight;

              return (
                <g key={item.roomType}>
                  {/* Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={item.color}
                    rx="4"
                    className="transition-opacity hover:opacity-80 cursor-pointer"
                  >
                    <title>
                      {item.roomType}: ${item.revenue.toFixed(2)} ({item.percentage.toFixed(1)}%)
                    </title>
                  </rect>

                  {/* Value label on top of bar */}
                  {barHeight > 30 && (
                    <text
                      x={x + barWidth / 2}
                      y={y - 8}
                      textAnchor="middle"
                      className="text-xs font-semibold fill-[#2C2C2C]"
                      style={{ fontFamily: 'DM Sans, sans-serif' }}
                    >
                      {formatCurrency(item.revenue)}
                    </text>
                  )}

                  {/* Percentage label inside bar */}
                  {barHeight > 40 && (
                    <text
                      x={x + barWidth / 2}
                      y={y + barHeight / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs font-medium fill-white"
                      style={{ fontFamily: 'DM Sans, sans-serif' }}
                    >
                      {item.percentage.toFixed(1)}%
                    </text>
                  )}

                  {/* X-axis label */}
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight - padding.bottom + 20}
                    textAnchor="middle"
                    className="text-xs fill-[#8B8B8B]"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {item.roomType.length > 12
                      ? `${item.roomType.substring(0, 12)}...`
                      : item.roomType}
                  </text>
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

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#E8E0D5]">
          {data.slice(0, 4).map(item => (
            <div key={item.roomType} className="space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-[#8B8B8B] truncate">{item.roomType}</span>
              </div>
              <p className="font-semibold text-[#2C2C2C] text-sm">
                ${item.revenue.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
