'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, DollarSign, TrendingUp, CreditCard, PieChart } from 'lucide-react';
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ReportCard } from '@/components/dashboard/ReportCard';
import { ReportTable } from '@/components/dashboard/ReportTable';
import { format, subDays } from 'date-fns';

// Mock data - replace with real data from database
const generateMockRevenueData = (days: number) => {
  const data = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const bookings = Math.floor(Math.random() * 8) + 2;
    const revenue = bookings * (Math.floor(Math.random() * 200) + 150);

    data.push({
      date: format(date, 'MMM dd'),
      revenue,
      bookings,
    });
  }

  return data;
};

const mockRoomTypeRevenue = [
  {
    roomType: 'Deluxe Suite',
    bookings: 27,
    revenue: 37800,
    adr: 1400,
    revpar: 1260,
  },
  {
    roomType: 'Executive Room',
    totalRooms: 15,
    bookings: 36,
    revenue: 32400,
    adr: 900,
    revpar: 720,
  },
  {
    roomType: 'Standard Room',
    bookings: 48,
    revenue: 28800,
    adr: 600,
    revpar: 480,
  },
  {
    roomType: 'Family Suite',
    bookings: 9,
    revenue: 8100,
    adr: 900,
    revpar: 540,
  },
];

const mockPaymentMethods = [
  { method: 'Credit Card', transactions: 85, revenue: 85200, percentage: 80 },
  { method: 'Debit Card', transactions: 15, revenue: 15300, percentage: 14 },
  { method: 'Bank Transfer', transactions: 5, revenue: 6000, percentage: 6 },
];

export default function RevenueReportPage() {
  const t = useTranslations('dashboard.reports.revenue');
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const chartData = generateMockRevenueData(30);

  // Calculate overall metrics
  const totalRevenue = chartData.reduce((sum, day) => sum + day.revenue, 0);
  const totalBookings = chartData.reduce((sum, day) => sum + day.bookings, 0);
  const averageDailyRate = Math.round(totalRevenue / totalBookings);
  const totalRooms = 50;
  const daysInPeriod = chartData.length;
  const revenuePerAvailableRoom = Math.round(totalRevenue / (totalRooms * daysInPeriod));

  const roomTypeColumns = [
    { key: 'roomType', label: 'Room Type', align: 'left' as const },
    { key: 'bookings', label: 'Bookings', align: 'center' as const },
    {
      key: 'revenue',
      label: 'Revenue',
      align: 'right' as const,
      format: (value: number) => `$${value.toLocaleString()}`
    },
    {
      key: 'adr',
      label: 'ADR',
      align: 'right' as const,
      format: (value: number) => `$${value.toLocaleString()}`
    },
    {
      key: 'revpar',
      label: 'RevPAR',
      align: 'right' as const,
      format: (value: number) => `$${value.toLocaleString()}`
    },
  ];

  const paymentColumns = [
    { key: 'method', label: 'Payment Method', align: 'left' as const },
    { key: 'transactions', label: 'Transactions', align: 'center' as const },
    {
      key: 'revenue',
      label: 'Revenue',
      align: 'right' as const,
      format: (value: number) => `$${value.toLocaleString()}`
    },
    {
      key: 'percentage',
      label: 'Percentage',
      align: 'right' as const,
      format: (value: number) => `${value}%`
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
          title="Total Revenue"
          value={totalRevenue}
          format="currency"
          icon={DollarSign}
          iconColor="text-emerald-600"
          trend={{ value: 12.5, isPositive: true }}
          description="vs last period"
        />
        <ReportCard
          title="Average Daily Rate"
          value={averageDailyRate}
          format="currency"
          icon={TrendingUp}
          iconColor="text-amber-600"
          description="ADR"
        />
        <ReportCard
          title="Revenue Per Available Room"
          value={revenuePerAvailableRoom}
          format="currency"
          icon={PieChart}
          iconColor="text-blue-600"
          description="RevPAR"
        />
        <ReportCard
          title="Total Bookings"
          value={totalBookings}
          icon={CreditCard}
          iconColor="text-purple-600"
          trend={{ value: 8.3, isPositive: true }}
          description="Completed bookings"
        />
      </div>

      {/* Revenue Trend Chart */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('charts.trend')}
          </h2>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm font-medium text-amber-700 bg-amber-50 rounded-md hover:bg-amber-100">
              Area
            </button>
            <button className="px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Bar
            </button>
          </div>
        </div>
        <RevenueChart data={chartData} type="area" period="daily" />
      </div>

      {/* Revenue by Room Type */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {t('tables.byRoomType')}
        </h2>
        <ReportTable
          columns={roomTypeColumns}
          data={mockRoomTypeRevenue}
          description="Revenue metrics broken down by room type including ADR and RevPAR"
        />
      </div>

      {/* Payment Methods Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {t('tables.paymentMethods')}
        </h2>
        <ReportTable
          columns={paymentColumns}
          data={mockPaymentMethods}
          description="Revenue distribution across different payment methods"
        />
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Revenue Insights
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2">•</span>
              <span>Revenue increased by 12.5% compared to previous period</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2">•</span>
              <span>Deluxe Suites generate the highest revenue at $37,800</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-600 mr-2">•</span>
              <span>ADR improved across all room categories</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Recommendations
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">•</span>
              <span>Consider dynamic pricing for Standard Rooms during peak periods</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">•</span>
              <span>Promote Family Suites to increase their contribution to total revenue</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">•</span>
              <span>Optimize RevPAR by adjusting rates based on occupancy forecasts</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
