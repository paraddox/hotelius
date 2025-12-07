import { Badge } from '@/components/ui/Badge';

export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'inactive';

interface RoomStatusBadgeProps {
  status: RoomStatus;
  className?: string;
}

const statusConfig: Record<RoomStatus, { variant: 'success' | 'info' | 'error' | 'warning' | 'default'; label: string }> = {
  available: {
    variant: 'success',
    label: 'Available',
  },
  occupied: {
    variant: 'info',
    label: 'Occupied',
  },
  maintenance: {
    variant: 'error',
    label: 'Maintenance',
  },
  cleaning: {
    variant: 'warning',
    label: 'Cleaning',
  },
  inactive: {
    variant: 'default',
    label: 'Inactive',
  },
};

export function RoomStatusBadge({ status, className }: RoomStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
