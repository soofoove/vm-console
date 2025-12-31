import { Vm, VmStatus } from '../models/vm.models';

export const pad = (value: number) => String(value).padStart(2, '0');

export const formatDate = (date: Date) =>
  `${pad(date.getDate())}.${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const hoursBetween = (start: Date, end: Date) => (end.getTime() - start.getTime()) / 36e5;

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const computeTtl = (vm: Vm) => {
  const now = new Date();
  const leftHours = hoursBetween(now, vm.deleteAt);
  return {
    leftHours,
    expiring: leftHours <= 24 && leftHours > 0,
    expired: leftHours <= 0
  };
};

export const ttlLabel = (vm: Vm) => {
  const { leftHours, expired } = computeTtl(vm);
  if (expired) {
    return { label: 'expired', kind: 'danger' } as const;
  }
  if (leftHours < 1) {
    return { label: `~ ${Math.max(1, Math.round(leftHours * 60))}m`, kind: 'danger' } as const;
  }
  if (leftHours <= 24) {
    return { label: `~ ${Math.round(leftHours)}h`, kind: 'warn' } as const;
  }
  const days = leftHours / 24;
  return { label: `~ ${days >= 2 ? Math.round(days) : days.toFixed(1)}d`, kind: 'default' } as const;
};

export const statusMeta = (status: VmStatus) => {
  const map: Record<VmStatus, { className: string; label: string }> = {
    Running: { className: 'running', label: 'Running' },
    Starting: { className: 'starting', label: 'Starting' },
    Stopped: { className: 'stopped', label: 'Stopped' },
    Deleting: { className: 'deleting', label: 'Deleting' }
  };
  return map[status];
};

export const sshCommand = (vm: Vm) => {
  const user = vm.template.includes('Windows') ? 'Administrator' : 'ubuntu';
  return `ssh ${user}@${vm.ip || vm.dns || '0.0.0.0'}`;
};
