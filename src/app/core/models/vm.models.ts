export type VmStatus = 'Running' | 'Starting' | 'Stopped' | 'Deleting';

export interface Vm {
  id: string;
  name: string;
  project: string;
  template: string;
  status: VmStatus;
  cpu: number;
  ram: number;
  disk: number;
  ip: string;
  dns: string;
  tags: string[];
  createdAt: Date;
  deleteAt: Date;
}

export type NotificationKind = 'info' | 'warn' | 'danger';

export interface Notification {
  id: string;
  kind: NotificationKind;
  text: string;
  vmId: string | null;
  read: boolean;
  at: Date;
}

export interface EventLog {
  id: string;
  at: Date;
  type: string;
  vmName: string;
  status: VmStatus | '';
}

export interface VmFilters {
  search: string;
  scope: 'all' | 'active' | 'expiring';
  statusFilter: 'all' | VmStatus;
  projectFilter: 'all' | string;
  pageIndex: number;
  pageSize: number;
}

export interface VmSettings {
  autoRefresh: boolean;
  toasts: boolean;
  cpuQuota: number;
}

export interface VmState {
  vms: Vm[];
  selectedIds: Set<string>;
  notifications: Notification[];
  events: EventLog[];
  filters: VmFilters;
  activeVmId: string | null;
}
