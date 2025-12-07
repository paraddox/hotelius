'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface OccupancyDataPoint {
  date: string;
  occupancyRate: number;
  bookedRooms: number;
  availableRooms: number;
}

interface OccupancyChartProps {
  data: OccupancyDataPoint[];
  type?: 'line' | 'bar';
}

export function OccupancyChart({ data, type = 'line' }: OccupancyChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 rounded-lg shadow-lg" style={{ backgroundColor: 'var(--background)', borderWidth: '1px', borderColor: 'var(--color-sand)' }}>
          <p className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Occupancy Rate' ? `${entry.value}%` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (type === 'bar') {
    return (
      <div className="w-full h-80 p-6 rounded-lg" style={{ backgroundColor: 'var(--background)', borderWidth: '1px', borderColor: 'var(--color-sand)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-sand)" />
            <XAxis
              dataKey="date"
              tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }}
              tickLine={{ stroke: 'var(--color-sand)' }}
            />
            <YAxis
              tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }}
              tickLine={{ stroke: 'var(--color-sand)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Bar
              dataKey="occupancyRate"
              name="Occupancy Rate"
              fill="var(--color-terracotta)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-80 p-6 rounded-lg" style={{ backgroundColor: 'var(--background)', borderWidth: '1px', borderColor: 'var(--color-sand)' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-sand)" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }}
            tickLine={{ stroke: 'var(--color-sand)' }}
          />
          <YAxis
            tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }}
            tickLine={{ stroke: 'var(--color-sand)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Line
            type="monotone"
            dataKey="occupancyRate"
            name="Occupancy Rate"
            stroke="var(--color-terracotta)"
            strokeWidth={3}
            dot={{ fill: 'var(--color-terracotta)', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="bookedRooms"
            name="Booked Rooms"
            stroke="var(--color-success)"
            strokeWidth={2}
            dot={{ fill: 'var(--color-success)', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
