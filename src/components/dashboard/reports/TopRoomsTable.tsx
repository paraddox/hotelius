'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from '@/components/ui/Table';
import { TopRoom } from '@/lib/api/reports';
import { Badge } from '@/components/ui/Badge';
import { Hotel, TrendingUp } from 'lucide-react';

interface TopRoomsTableProps {
  data: TopRoom[];
  title?: string;
}

export function TopRoomsTable({ data, title = 'Top Performing Rooms' }: TopRoomsTableProps) {
  const getOccupancyBadge = (rate: number) => {
    if (rate >= 80) {
      return (
        <Badge variant="success" className="bg-[#5AAF5A]">
          {rate.toFixed(1)}%
        </Badge>
      );
    } else if (rate >= 50) {
      return (
        <Badge variant="warning" className="bg-[#C4A484]">
          {rate.toFixed(1)}%
        </Badge>
      );
    } else {
      return (
        <Badge variant="error" className="bg-[#C45C5C]">
          {rate.toFixed(1)}%
        </Badge>
      );
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Bookings</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Occupancy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!data || data.length === 0 ? (
              <TableEmpty
                colSpan={6}
                icon={<Hotel className="w-6 h-6" />}
                title="No room data available"
                description="There is no room performance data for the selected period."
              />
            ) : (
              data.map((room, index) => (
                <TableRow key={room.roomNumber}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <TrendingUp className="w-4 h-4 text-[#C4A484]" />
                      )}
                      <span className="text-[#8B8B8B]">#{index + 1}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-[#2C2C2C]">
                      {room.roomNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-[#8B8B8B]">{room.roomType}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium">{room.bookings}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-[#2C2C2C]">
                      {formatCurrency(room.revenue)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {getOccupancyBadge(room.occupancyRate)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {data && data.length > 0 && (
          <div className="p-6 bg-[#FAF7F2] border-t border-[#E8E0D5]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-1">
                  Total Bookings
                </p>
                <p className="font-['Cormorant_Garamond',Georgia,serif] text-2xl font-semibold text-[#2C2C2C]">
                  {data.reduce((sum, room) => sum + room.bookings, 0)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-1">
                  Total Revenue
                </p>
                <p className="font-['Cormorant_Garamond',Georgia,serif] text-2xl font-semibold text-[#2C2C2C]">
                  {formatCurrency(data.reduce((sum, room) => sum + room.revenue, 0))}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-1">
                  Average Occupancy
                </p>
                <p className="font-['Cormorant_Garamond',Georgia,serif] text-2xl font-semibold text-[#2C2C2C]">
                  {(data.reduce((sum, room) => sum + room.occupancyRate, 0) / data.length).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
