import { Badge } from '@/components/ui/Badge';
import type { RoomStatus as DatabaseRoomStatus } from '@/types/database';

export type RoomStatus = DatabaseRoomStatus;

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
  out_of_service: {
    variant: 'default',
    label: 'Out of Service',
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
