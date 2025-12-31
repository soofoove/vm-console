import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import {
  EventLog,
  Notification,
  Vm,
  VmFilters,
  VmSettings,
  VmState,
  VmStatus
} from '../models/vm.models';
import { clamp, computeTtl, hoursBetween, sshCommand } from '../utils/vm-utils';
import { ToastService } from './toast.service';
import { ClipboardService } from './clipboard.service';
import { ConfirmService } from './confirm.service';

const randomId = () => `${Math.random().toString(16).slice(2, 10)}-${Math.random().toString(16).slice(2, 6)}`;

@Injectable({ providedIn: 'root' })
export class VmStoreService {
  private readonly settingsSubject = new BehaviorSubject<VmSettings>({
    autoRefresh: true,
    toasts: true,
    cpuQuota: 20
  });
  readonly settings$ = this.settingsSubject.asObservable();

  private readonly requestModalSubject = new BehaviorSubject<boolean>(false);
  readonly requestModal$ = this.requestModalSubject.asObservable();

  private readonly stateSubject = new BehaviorSubject<VmState>({
    vms: [],
    selectedIds: new Set(),
    notifications: [],
    events: [],
    filters: {
      search: '',
      scope: 'all',
      statusFilter: 'all',
      projectFilter: 'all',
      pageIndex: 1,
      pageSize: 7
    },
    activeVmId: null
  });

  readonly state$ = this.stateSubject.asObservable();
  readonly vms$ = this.state$.pipe(map((state) => state.vms));
  readonly notifications$ = this.state$.pipe(map((state) => state.notifications));
  readonly events$ = this.state$.pipe(map((state) => state.events));
  readonly filters$ = this.state$.pipe(map((state) => state.filters));
  readonly selectedIds$ = this.state$.pipe(map((state) => state.selectedIds));
  readonly activeVmId$ = this.state$.pipe(map((state) => state.activeVmId));
  readonly totalVms$ = this.vms$.pipe(map((vms) => vms.length));

  readonly unreadNotificationsCount$ = this.notifications$.pipe(
    map((notifications) => notifications.filter((notice) => !notice.read).length)
  );

  readonly noticeList$ = this.notifications$.pipe(
    map((notifications) => notifications.filter((notice) => !notice.read).slice(0, 3))
  );

  readonly projects$ = this.vms$.pipe(
    map((vms) => Array.from(new Set(vms.map((vm) => vm.project))).sort())
  );

  readonly filteredVms$ = combineLatest([this.vms$, this.filters$]).pipe(
    map(([vms, filters]) => this.filterVms(vms, filters))
  );

  readonly filteredCount$ = this.filteredVms$.pipe(map((vms) => vms.length));

  readonly pagedVms$ = combineLatest([this.filteredVms$, this.filters$]).pipe(
    map(([vms, filters]) => this.pageVms(vms, filters))
  );

  readonly pageInfo$ = combineLatest([this.filteredVms$, this.filters$]).pipe(
    map(([vms, filters]) => {
      const total = vms.length;
      const pageTotal = Math.max(1, Math.ceil(total / filters.pageSize));
      const pageIndex = clamp(filters.pageIndex, 1, pageTotal);
      return { total, pageTotal, pageIndex };
    })
  );

  readonly selectedCount$ = this.selectedIds$.pipe(map((selected) => selected.size));

  readonly isAllVisibleSelected$ = combineLatest([this.pagedVms$, this.selectedIds$]).pipe(
    map(([paged, selected]) => paged.items.length > 0 && paged.items.every((vm) => selected.has(vm.id)))
  );

  readonly kpi$ = combineLatest([this.vms$, this.settings$, this.events$]).pipe(
    map(([vms, settings, events]) => {
      const active = vms.filter((vm) => ['Running', 'Starting'].includes(vm.status)).length;
      const expiring = vms.filter((vm) => computeTtl(vm).expiring).length;
      const cpuUsed = vms
        .filter((vm) => ['Running', 'Starting'].includes(vm.status))
        .reduce((sum, vm) => sum + vm.cpu, 0);
      const pct = settings.cpuQuota ? Math.round((cpuUsed / settings.cpuQuota) * 100) : 0;
      return {
        active,
        expiring,
        cpuUsed,
        cpuQuota: settings.cpuQuota,
        cpuPct: clamp(pct, 0, 999),
        eventsCount: events.length
      };
    })
  );

  constructor(
    private readonly toastService: ToastService,
    private readonly clipboardService: ClipboardService,
    private readonly confirmService: ConfirmService
  ) {
    this.seedVms(8);
    this.addNotification({
      kind: 'info',
      text: 'Добро пожаловать! Быстрые операции теперь в списке ВМ 🙂',
      vmId: null
    });
    this.refreshAutoNotices();
  }

  get settingsSnapshot() {
    return this.settingsSubject.value;
  }

  get stateSnapshot() {
    return this.stateSubject.value;
  }

  openRequestModal() {
    this.requestModalSubject.next(true);
  }

  closeRequestModal() {
    this.requestModalSubject.next(false);
  }

  setSearch(search: string) {
    this.patchFilters({ search, pageIndex: 1 });
  }

  setScope(scope: VmFilters['scope']) {
    this.patchFilters({ scope, pageIndex: 1 });
  }

  setStatusFilter(statusFilter: VmFilters['statusFilter']) {
    this.patchFilters({ statusFilter, pageIndex: 1 });
  }

  setProjectFilter(projectFilter: VmFilters['projectFilter']) {
    this.patchFilters({ projectFilter, pageIndex: 1 });
  }

  setPageIndex(pageIndex: number) {
    const filtered = this.filterVms(this.stateSnapshot.vms, this.stateSnapshot.filters);
    const pageTotal = Math.max(1, Math.ceil(filtered.length / this.stateSnapshot.filters.pageSize));
    this.patchFilters({ pageIndex: clamp(pageIndex, 1, pageTotal) });
  }

  toggleVmSelection(vmId: string, selected: boolean) {
    const next = new Set(this.stateSnapshot.selectedIds);
    selected ? next.add(vmId) : next.delete(vmId);
    this.patchState({ selectedIds: next });
  }

  toggleSelectAllVisible(vms: Vm[]) {
    const next = new Set(this.stateSnapshot.selectedIds);
    const allSelected = vms.length > 0 && vms.every((vm) => next.has(vm.id));
    if (allSelected) {
      vms.forEach((vm) => next.delete(vm.id));
    } else {
      vms.forEach((vm) => next.add(vm.id));
    }
    this.patchState({ selectedIds: next });
  }

  clearSelection() {
    this.patchState({ selectedIds: new Set() });
  }

  openVmDetails(vmId: string) {
    this.patchState({ activeVmId: vmId });
  }

  closeVmDetails() {
    this.patchState({ activeVmId: null });
  }

  updateSettings(settings: Partial<VmSettings>) {
    this.settingsSubject.next({ ...this.settingsSubject.value, ...settings });
  }

  addEvent(type: string, vmName = '', status: VmStatus | '' = '') {
    const event: EventLog = { id: randomId(), at: new Date(), type, vmName, status };
    const next = [event, ...this.stateSnapshot.events].slice(0, 200);
    this.patchState({ events: next });
  }

  clearEvents() {
    this.patchState({ events: [] });
    this.toast('События очищены', 'warn');
  }

  addNotification({ kind, text, vmId }: Pick<Notification, 'kind' | 'text' | 'vmId'>) {
    const notice: Notification = {
      id: randomId(),
      kind,
      text,
      vmId,
      read: false,
      at: new Date()
    };
    this.patchState({ notifications: [notice, ...this.stateSnapshot.notifications] });
  }

  markNotificationRead(id: string) {
    const next = this.stateSnapshot.notifications.map((notice) =>
      notice.id === id ? { ...notice, read: true } : notice
    );
    this.patchState({ notifications: next });
  }

  markAllNotificationsRead() {
    const next = this.stateSnapshot.notifications.map((notice) => ({ ...notice, read: true }));
    this.patchState({ notifications: next });
    this.toast('Все прочитано', 'ok');
  }

  clearNotifications() {
    this.patchState({ notifications: [] });
    this.toast('Уведомления удалены', 'warn');
  }

  markNoticesRead() {
    const next = this.stateSnapshot.notifications.map((notice) => ({ ...notice, read: true }));
    this.patchState({ notifications: next });
    this.toast('Уведомления очищены', 'ok');
  }

  seedVms(count: number) {
    const now = new Date();
    const templates = ['Ubuntu 24.04 + Docker', 'Ubuntu 22.04 Minimal', 'Windows Server 2022'];
    const projects = ['dev', 'ci', 'demo', 'sandbox'];
    const statuses: VmStatus[] = ['Running', 'Running', 'Starting', 'Stopped'];
    const newVms: Vm[] = Array.from({ length: count }).map(() => {
      const id = randomId();
      const project = projects[Math.floor(Math.random() * projects.length)];
      const template = templates[Math.floor(Math.random() * templates.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const cpu = [1, 2, 2, 4, 4, 8][Math.floor(Math.random() * 6)];
      const ram = [2, 4, 4, 8, 16][Math.floor(Math.random() * 5)];
      const disk = [40, 60, 80, 120][Math.floor(Math.random() * 4)];
      const createdAt = new Date(now.getTime() - Math.floor(Math.random() * 48) * 36e5);
      const ttlHours = [6, 12, 24, 48, 72, 120][Math.floor(Math.random() * 6)];
      const deleteAt = new Date(createdAt.getTime() + ttlHours * 36e5);
      const ip = status === 'Starting' ? '' : `10.10.${Math.floor(Math.random() * 10)}.${Math.floor(10 + Math.random() * 200)}`;
      const name = `vm-${project}-${String(Math.floor(Math.random() * 90) + 10).padStart(2, '0')}`;
      const dns = `${name}.local`;
      return {
        id,
        name,
        project,
        template,
        status,
        cpu,
        ram,
        disk,
        ip,
        dns,
        tags: [project, template.includes('Windows') ? 'win' : 'linux', status.toLowerCase()],
        createdAt,
        deleteAt
      };
    });

    this.patchState({ vms: [...this.stateSnapshot.vms, ...newVms] });
    this.pruneSelection();
    this.addEvent('Seed VMs', '', '');
    this.toast(`Добавлено ${count} VM (mock)`, 'ok');
    this.refreshAutoNotices();
  }

  exportVms() {
    this.addEvent('Export VMs (mock)', '', '');
    this.toast('Экспорт VMs (mock)', 'info');
  }

  exportEvents() {
    this.addEvent('Export Events (mock)', '', '');
    this.toast('Экспорт событий (mock)', 'info');
  }

  showToast(message: string, kind: 'info' | 'ok' | 'warn' | 'danger' = 'info') {
    this.toast(message, kind);
  }

  async runAction(action: 'extend' | 'restart' | 'stop' | 'start' | 'delete' | 'copyssh', ids: string[]) {
    const vms = ids.map((id) => this.stateSnapshot.vms.find((vm) => vm.id === id)).filter(Boolean) as Vm[];
    if (vms.length === 0) {
      this.toast('Сначала выбери хотя бы одну ВМ', 'warn');
      return;
    }

    const applyAction = () => {
      const updated = [...this.stateSnapshot.vms];
      vms.forEach((vm) => {
        const idx = updated.findIndex((item) => item.id === vm.id);
        if (idx === -1) {
          return;
        }
        if (action === 'extend') {
          updated[idx] = { ...updated[idx], deleteAt: new Date(updated[idx].deleteAt.getTime() + 24 * 36e5) };
          this.addEvent('Extend TTL +24h', vm.name, vm.status);
        }
        if (action === 'restart') {
          this.addEvent('Restart VM', vm.name, vm.status);
        }
        if (action === 'stop') {
          updated[idx] = { ...updated[idx], status: 'Stopped' };
          this.addEvent('Stop VM', vm.name, 'Stopped');
        }
        if (action === 'start') {
          updated[idx] = { ...updated[idx], status: 'Starting' };
          this.addEvent('Start VM', vm.name, 'Starting');
        }
        if (action === 'delete') {
          updated[idx] = { ...updated[idx], status: 'Deleting' };
          this.addEvent('Delete VM (requested)', vm.name, 'Deleting');
        }
        if (action === 'copyssh') {
          this.clipboardService.copy(sshCommand(vm), `SSH скопирован для ${vm.name}`);
        }
      });
      this.patchState({ vms: updated });
    };

    if (action === 'delete') {
      const confirmed = await this.confirmService.confirm(
        'Удалить ВМ?',
        `Удалить: ${vms.map((vm) => vm.name).join(', ')} (mock)`
      );
      if (!confirmed) {
        return;
      }
      applyAction();
      setTimeout(() => {
        const idsSet = new Set(vms.map((vm) => vm.id));
        const remaining = this.stateSnapshot.vms.filter((vm) => !idsSet.has(vm.id));
        this.patchState({
          vms: remaining,
          selectedIds: new Set([...this.stateSnapshot.selectedIds].filter((id) => !idsSet.has(id)))
        });
        this.addEvent('VM deleted (mock)', vms[0].name, '');
        this.toast('ВМ удалены (mock)', 'danger');
        this.refreshAutoNotices();
      }, 1200);
      return;
    }

    if (action === 'start') {
      applyAction();
      this.toast('Start requested (mock)', 'ok');
      setTimeout(() => {
        const updated = this.stateSnapshot.vms.map((vm) => {
          if (vms.find((item) => item.id === vm.id) && vm.status === 'Starting') {
            const ip = vm.ip || `10.10.${Math.floor(Math.random() * 10)}.${Math.floor(10 + Math.random() * 200)}`;
            const next = { ...vm, status: 'Running' as VmStatus, ip };
            this.addEvent('VM is Running', next.name, next.status);
            return next;
          }
          return vm;
        });
        this.patchState({ vms: updated });
        this.refreshAutoNotices();
      }, 1200);
      return;
    }

    applyAction();
    if (action === 'extend') this.toast('TTL продлён (+24ч)', 'ok');
    if (action === 'stop') this.toast('Остановлено', 'warn');
    if (action === 'restart') this.toast('Restart (mock)', 'info');
    this.refreshAutoNotices();
  }

  shortenTtl(vm: Vm) {
    const updated = this.stateSnapshot.vms.map((item) =>
      item.id === vm.id ? { ...item, deleteAt: new Date(item.deleteAt.getTime() - 2 * 36e5) } : item
    );
    this.patchState({ vms: updated });
    this.addEvent('Shorten TTL -2h', vm.name, vm.status);
    this.toast('TTL уменьшен (-2ч)', 'warn');
    this.refreshAutoNotices();
  }

  submitRequest(request: {
    name: string;
    project: string;
    template: string;
    ttlHours: number;
    cpu: number;
    ram: number;
    disk: number;
  }) {
    const createdAt = new Date();
    const deleteAt = new Date(createdAt.getTime() + request.ttlHours * 36e5);
    const id = randomId();
    const dns = `${request.name}.local`;
    const vm: Vm = {
      id,
      name: request.name,
      project: request.project,
      template: request.template,
      status: 'Starting',
      cpu: request.cpu,
      ram: request.ram,
      disk: request.disk,
      ip: '',
      dns,
      tags: [request.project, request.template.includes('Windows') ? 'win' : 'linux', 'requested'],
      createdAt,
      deleteAt
    };
    this.patchState({ vms: [...this.stateSnapshot.vms, vm] });
    this.addEvent('Request VM submitted', vm.name, 'Starting');
    this.addNotification({ kind: 'info', text: `Заявка принята: ${vm.name} (Starting)`, vmId: vm.id });
    this.toast('Заявка отправлена (mock)', 'ok');
    this.refreshAutoNotices();

    setTimeout(() => {
      const updated = this.stateSnapshot.vms.map((item) => {
        if (item.id !== id) return item;
        const ip = `10.10.${Math.floor(Math.random() * 10)}.${Math.floor(10 + Math.random() * 200)}`;
        const tags = Array.from(new Set([...(item.tags || []), 'provisioned']));
        const next = { ...item, status: 'Running' as VmStatus, ip, tags };
        this.addEvent('VM provisioned', next.name, next.status);
        this.addNotification({ kind: 'info', text: `Готово: ${next.name} (Running)`, vmId: next.id });
        this.toast(`${next.name} готова`, 'ok');
        return next;
      });
      this.patchState({ vms: updated });
      this.refreshAutoNotices();
    }, 1500);
  }

  runAutoRefreshTick() {
    if (Math.random() < 0.12 && this.stateSnapshot.vms.length) {
      const vm = this.stateSnapshot.vms[Math.floor(Math.random() * this.stateSnapshot.vms.length)];
      if (vm.status === 'Running' && Math.random() < 0.35) {
        this.updateVmStatus(vm.id, 'Stopped');
        this.addEvent('Auto: VM stopped (mock)', vm.name, 'Stopped');
        this.addNotification({ kind: 'warn', text: `VM остановилась (mock): ${vm.name}`, vmId: vm.id });
      } else if (vm.status === 'Stopped' && Math.random() < 0.35) {
        const ip = vm.ip || `10.10.${Math.floor(Math.random() * 10)}.${Math.floor(10 + Math.random() * 200)}`;
        const updated = this.stateSnapshot.vms.map((item) =>
          item.id === vm.id ? { ...item, status: 'Running' as VmStatus, ip } : item
        );
        this.patchState({ vms: updated });
        this.addEvent('Auto: VM running (mock)', vm.name, 'Running');
      }
    }
    this.refreshTtlExpirations();
    this.refreshAutoNotices();
  }

  updateVmStatus(vmId: string, status: VmStatus) {
    const updated = this.stateSnapshot.vms.map((vm) => (vm.id === vmId ? { ...vm, status } : vm));
    this.patchState({ vms: updated });
    this.refreshAutoNotices();
  }

  private filterVms(vms: Vm[], filters: VmFilters) {
    const query = filters.search.trim().toLowerCase();
    let list = [...vms];
    if (filters.scope === 'active') {
      list = list.filter((vm) => ['Running', 'Starting'].includes(vm.status));
    } else if (filters.scope === 'expiring') {
      list = list.filter((vm) => computeTtl(vm).expiring);
    }
    if (filters.statusFilter !== 'all') {
      list = list.filter((vm) => vm.status === filters.statusFilter);
    }
    if (filters.projectFilter !== 'all') {
      list = list.filter((vm) => vm.project === filters.projectFilter);
    }
    if (query) {
      list = list.filter((vm) => {
        const hay = [vm.name, vm.ip, vm.dns, vm.project, vm.template, (vm.tags || []).join(' ')]
          .join(' ')
          .toLowerCase();
        return hay.includes(query);
      });
    }
    list.sort((a, b) => {
      const la = hoursBetween(new Date(), a.deleteAt);
      const lb = hoursBetween(new Date(), b.deleteAt);
      return la - lb || a.name.localeCompare(b.name);
    });
    return list;
  }

  private pageVms(vms: Vm[], filters: VmFilters) {
    const total = vms.length;
    const pageTotal = Math.max(1, Math.ceil(total / filters.pageSize));
    const pageIndex = clamp(filters.pageIndex, 1, pageTotal);
    const start = (pageIndex - 1) * filters.pageSize;
    return { total, pageTotal, pageIndex, items: vms.slice(start, start + filters.pageSize) };
  }

  private refreshTtlExpirations() {
    const updated = this.stateSnapshot.vms.map((vm) => {
      const ttl = computeTtl(vm);
      if (ttl.expired && vm.status !== 'Deleting') {
        this.addEvent('TTL expired → deleting', vm.name, 'Deleting');
        return { ...vm, status: 'Deleting' as VmStatus };
      }
      return vm;
    });
    this.patchState({ vms: updated });
  }

  private refreshAutoNotices() {
    const preserved = this.stateSnapshot.notifications.filter(
      (notice) => notice.kind === 'info' && notice.text.startsWith('Добро пожаловать')
    );
    const expiring = this.stateSnapshot.vms
      .filter((vm) => computeTtl(vm).expiring && vm.status !== 'Deleting')
      .sort((a, b) => a.deleteAt.getTime() - b.deleteAt.getTime())
      .slice(0, 5)
      .map((vm) => {
        const left = computeTtl(vm).leftHours;
        return {
          id: randomId(),
          kind: left <= 6 ? 'danger' : 'warn',
          text: `${vm.name} истекает через ~ ${Math.max(1, Math.round(left))}ч`,
          vmId: vm.id,
          read: false,
          at: new Date()
        } satisfies Notification;
      });
    this.patchState({ notifications: [...expiring, ...preserved] });
  }

  private patchFilters(filters: Partial<VmFilters>) {
    this.patchState({ filters: { ...this.stateSnapshot.filters, ...filters } });
  }

  private patchState(partial: Partial<VmState>) {
    this.stateSubject.next({ ...this.stateSnapshot, ...partial });
  }

  private pruneSelection() {
    const existingIds = new Set(this.stateSnapshot.vms.map((vm) => vm.id));
    const next = new Set([...this.stateSnapshot.selectedIds].filter((id) => existingIds.has(id)));
    this.patchState({ selectedIds: next });
  }

  private toast(message: string, kind: 'info' | 'ok' | 'warn' | 'danger' = 'info') {
    if (!this.settingsSnapshot.toasts) {
      return;
    }
    this.toastService.show(message, kind);
  }
}
