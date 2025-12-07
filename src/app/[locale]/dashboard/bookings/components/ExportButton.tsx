'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  label: string;
  dateRange?: string;
  status?: string;
}

export default function ExportButton({ label, dateRange, status }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Build query parameters
      const params = new URLSearchParams();
      if (dateRange) params.append('dateRange', dateRange);
      if (status) params.append('status', status);

      // Call the export API
      const response = await fetch(`/api/bookings/export?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the CSV content
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      link.download = `bookings-export-${date}.csv`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export bookings. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download className={`h-4 w-4 ${isExporting ? 'animate-pulse' : ''}`} />
      {isExporting ? 'Exporting...' : label}
    </button>
  );
}
