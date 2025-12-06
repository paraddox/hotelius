'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Users, Bed, CheckCircle } from 'lucide-react';
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';
import { ReportCard } from '@/components/dashboard/ReportCard';
import { ReportTable } from '@/components/dashboard/ReportTable';
import { format, subDays } from 'date-fns';

// Mock data - replace with real data from database
const generateMockOccupancyData = (days: number) => {
  const data = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const occupancyRate = Math.floor(Math.random() * 40) + 60; // 60-100%
    const totalRooms = 50;
    const bookedRooms = Math.floor((occupancyRate / 100) * totalRooms);
    const availableRooms = totalRooms - bookedRooms;

    data.push({
      date: format(date, 'MMM dd'),
      occupancyRate,
      bookedRooms,
      availableRooms,
    });
  }

  return data;
};

const mockRoomTypeData = [
  {
    roomType: 'Deluxe Suite',
    totalRooms: 10,
    bookedRooms: 9,
    occupancyRate: 90,
    revenue: 12600,
  },
  {
    roomType: 'Executive Room',
    totalRooms: 15,
    bookedRooms: 12,
    occupancyRate: 80,
    revenue: 10800,
  },
  {
    roomType: 'Standard Room',
    totalRooms: 20,
    bookedRooms: 16,
    occupancyRate: 80,
    revenue: 9600,
  },
  {
    roomType: 'Family Suite',
    totalRooms: 5,
    bookedRooms: 3,
    occupancyRate: 60,
    revenue: 2700,
  },
];

export default function OccupancyReportPage() {
  const t = useTranslations('dashboard.reports.occupancy');
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const chartData = generateMockOccupancyData(30);

  // Calculate overall metrics
  const totalRooms = 50;
  const currentBookedRooms = 40;
  const currentOccupancyRate = Math.round((currentBookedRooms / totalRooms) * 100);
  const avgOccupancyRate = Math.round(
    chartData.reduce((sum, day) => sum + day.occupancyRate, 0) / chartData.length
  );

  const tableColumns = [
    { key: 'roomType', label: 'Room Type', align: 'left' as const },
    { key: 'totalRooms', label: 'Total Rooms', align: 'center' as const },
    { key: 'bookedRooms', label: 'Booked', align: 'center' as const },
    {
      key: 'occupancyRate',
      label: 'Occupancy Rate',
      align: 'center' as const,
      format: (value: number) => `${value}%`
    },
    {
      key: 'revenue',
      label: 'Revenue',
      align: 'right' as const,
      format: (value: number) => `$${value.toLocaleString()}`
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/reports"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-sm text-gray-700">{t('subtitle')}</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          Export Report
        </button>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter value={dateRange} onChange={setDateRange} />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <ReportCard
          title="Current Occupancy"
          value={currentOccupancyRate}
          format="percentage"
          icon={TrendingUp}
          iconColor="text-amber-600"
          trend={{ value: 5.2, isPositive: true }}
          description="vs last period"
        />
        <ReportCard
          title="Average Occupancy"
          value={avgOccupancyRate}
          format="percentage"
          icon={CheckCircle}
          iconColor="text-emerald-600"
          description="Last 30 days"
        />
        <ReportCard
          title="Booked Rooms"
          value={currentBookedRooms}
          icon={Bed}
          iconColor="text-blue-600"
          description={`of ${totalRooms} total rooms`}
        />
        <ReportCard
          title="Available Rooms"
          value={totalRooms - currentBookedRooms}
          icon={Users}
          iconColor="text-purple-600"
          description="Ready for booking"
        />
      </div>

      {/* Occupancy Trend Chart */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('charts.trend')}
          </h2>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm font-medium text-amber-700 bg-amber-50 rounded-md hover:bg-amber-100">
              Line
            </button>
            <button className="px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Bar
            </button>
          </div>
        </div>
        <OccupancyChart data={chartData} type="line" />
      </div>

      {/* Room Type Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {t('tables.byRoomType')}
        </h2>
        <ReportTable
          columns={tableColumns}
          data={mockRoomTypeData}
          description="Occupancy metrics broken down by room type for the selected period"
        />
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Key Insights
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-amber-600 mr-2">•</span>
            <span>Deluxe Suites are performing exceptionally well with 90% occupancy rate</span>
          </li>
          <li className="flex items-start">
            <span className="text-amber-600 mr-2">•</span>
            <span>Family Suites have room for improvement at 60% occupancy</span>
          </li>
          <li className="flex items-start">
            <span className="text-amber-600 mr-2">•</span>
            <span>Overall occupancy increased by 5.2% compared to previous period</span>
          </li>
          <li className="flex items-start">
            <span className="text-amber-600 mr-2">•</span>
            <span>Weekends show 15% higher occupancy than weekdays</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
