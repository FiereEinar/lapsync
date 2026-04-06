import React from 'react';
import { Badge } from './ui/Badge';

export function StatusBadge({ status }: { status: string }) {
  if (status === 'upcoming') {
    return <Badge variant="secondary">Upcoming</Badge>;
  }
  if (status === 'active' || status === 'running' || status === 'ongoing') {
    return <Badge variant="success">Active</Badge>;
  }
  if (status === 'completed') {
    return <Badge variant="default">Completed</Badge>;
  }
  if (status === 'cancelled') {
    return <Badge variant="destructive">Cancelled</Badge>;
  }
  return <Badge variant="outline">{status}</Badge>;
}
