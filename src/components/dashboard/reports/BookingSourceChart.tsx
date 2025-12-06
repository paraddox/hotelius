'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BookingSource } from '@/lib/api/reports';
import { EmptyState } from '@/components/ui/EmptyState';
import { PieChart } from 'lucide-react';

interface BookingSourceChartProps {
  data: BookingSource[];
  title?: string;
}

export function BookingSourceChart({ data, title = 'Booking Sources' }: BookingSourceChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<PieChart className="w-6 h-6" />}
            title="No booking source data available"
            description="There is no booking source data for the selected period."
          />
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);
  const centerX = 150;
  const centerY = 150;
  const radius = 100;
  const innerRadius = 60; // For donut chart

  // Calculate pie slices
  let currentAngle = -90; // Start at top
  const slices = data.map(item => {
    const percentage = item.percentage;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    return {
      ...item,
      startAngle,
      endAngle,
      midAngle: startAngle + angle / 2,
    };
  });

  // Convert polar to cartesian coordinates
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // Create donut path
  const createDonutPath = (
    cx: number,
    cy: number,
    outerRadius: number,
    innerRadius: number,
    startAngle: number,
    endAngle: number
  ) => {
    const outerStart = polarToCartesian(cx, cy, outerRadius, endAngle);
    const outerEnd = polarToCartesian(cx, cy, outerRadius, startAngle);
    const innerStart = polarToCartesian(cx, cy, innerRadius, endAngle);
    const innerEnd = polarToCartesian(cx, cy, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    const d = [
      'M', outerStart.x, outerStart.y,
      'A', outerRadius, outerRadius, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
      'L', innerEnd.x, innerEnd.y,
      'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      'Z',
    ].join(' ');

    return d;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Donut Chart */}
          <div className="flex-shrink-0">
            <svg width="300" height="300" viewBox="0 0 300 300">
              {/* Donut slices */}
              {slices.map((slice, index) => (
                <g key={slice.source}>
                  <path
                    d={createDonutPath(
                      centerX,
                      centerY,
                      radius,
                      innerRadius,
                      slice.startAngle,
                      slice.endAngle
                    )}
                    fill={slice.color}
                    className="transition-opacity hover:opacity-80 cursor-pointer"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <title>
                      {slice.source}: {slice.count} bookings ({slice.percentage.toFixed(1)}%)
                    </title>
                  </path>
                  {/* Percentage label */}
                  {slice.percentage >= 10 && (
                    <text
                      x={centerX + ((radius + innerRadius) / 2) * Math.cos((slice.midAngle * Math.PI) / 180)}
                      y={centerY + ((radius + innerRadius) / 2) * Math.sin((slice.midAngle * Math.PI) / 180)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-sm font-semibold fill-white pointer-events-none"
                      style={{ fontFamily: 'DM Sans, sans-serif' }}
                    >
                      {slice.percentage.toFixed(0)}%
                    </text>
                  )}
                </g>
              ))}

              {/* Center text */}
              <text
                x={centerX}
                y={centerY - 10}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-2xl font-bold fill-[#2C2C2C]"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                {total}
              </text>
              <text
                x={centerX}
                y={centerY + 15}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-[#8B8B8B]"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                Total Bookings
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-3">
            {data.map(item => (
              <div
                key={item.source}
                className="flex items-center justify-between p-3 rounded-lg bg-[#FAF7F2] hover:bg-[#F0EBE3] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="font-medium text-[#2C2C2C] text-sm">{item.source}</p>
                    <p className="text-xs text-[#8B8B8B]">{item.count} bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#2C2C2C]">
                    {item.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
