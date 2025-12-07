'use client';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface RevenueDataPoint {
  date: string;
  revenue: number;
  bookings: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  type?: 'area' | 'bar';
  period?: 'daily' | 'weekly' | 'monthly';
}

export function RevenueChart({ data, type = 'area', period = 'daily' }: RevenueChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 rounded-lg shadow-lg" style={{ backgroundColor: 'var(--background)', borderWidth: '1px', borderColor: 'var(--color-sand)' }}>
          <p className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Revenue' ? `$${entry.value.toLocaleString()}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  };

  if (type === 'bar') {
    return (
      <div className="w-full h-96 p-6 rounded-lg" style={{ backgroundColor: 'var(--background)', borderWidth: '1px', borderColor: 'var(--color-sand)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-terracotta)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-terracotta)" stopOpacity={0.3}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-sand)" />
            <XAxis
              dataKey="date"
              tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }}
              tickLine={{ stroke: 'var(--color-sand)' }}
            />
            <YAxis
              tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }}
              tickLine={{ stroke: 'var(--color-sand)' }}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Bar
              dataKey="revenue"
              name="Revenue"
              fill="url(#colorRevenue)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-96 p-6 rounded-lg" style={{ backgroundColor: 'var(--background)', borderWidth: '1px', borderColor: 'var(--color-sand)' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-terracotta)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--color-terracotta)" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-sand)" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }}
            tickLine={{ stroke: 'var(--color-sand)' }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }}
            tickLine={{ stroke: 'var(--color-sand)' }}
            tickFormatter={formatYAxis}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }}
            tickLine={{ stroke: 'var(--color-sand)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="var(--color-terracotta)"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="bookings"
            name="Bookings"
            stroke="var(--color-success)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorBookings)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
