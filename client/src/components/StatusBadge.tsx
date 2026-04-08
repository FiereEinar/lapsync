import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType =
  | 'finished'
  | 'active'
  | 'upcoming'
  | 'cancelled'
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'confirmed'
  | 'completed'
  | 'archived'
  | 'stopped';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<
  StatusType,
  {
    label: string;
    className: string;
  }
> = {
  active: {
    label: 'Active',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 hover:bg-emerald-500/15',
  },
  upcoming: {
    label: 'Upcoming',
    className: 'bg-primary/10 text-primary border-0 hover:bg-primary/15',
  },
  finished: {
    label: 'Finished',
    className: 'bg-muted text-muted-foreground border-0',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-destructive/10 text-destructive border-0',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-destructive/10 text-destructive border-0',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0',
  },
  completed: {
    label: 'Completed',
    className: 'bg-muted text-muted-foreground border-0',
  },
  archived: {
    label: 'Archived',
    className: 'bg-muted text-muted-foreground border-0',
  },
  stopped: {
    label: 'Stopped',
    className: 'bg-destructive/10 text-destructive border-0',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge className={cn('font-semibold text-[10px] uppercase tracking-wider', config.className, className)}>
      {config.label}
    </Badge>
  );
}
