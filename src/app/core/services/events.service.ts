import { Injectable } from '@angular/core';
import { VmStoreService } from './vm-store.service';
import { VmStatus } from '../models/vm.models';

@Injectable({ providedIn: 'root' })
export class EventsService {
  constructor(private readonly store: VmStoreService) {}

  addEvent(type: string, vmName = '', status: VmStatus | '' = '') {
    this.store.addEvent(type, vmName, status);
  }

  clearEvents() {
    this.store.clearEvents();
  }

  seedEvents() {
    ['Health check ok', 'Scheduler tick', 'Quota recalculated'].forEach((event) =>
      this.addEvent(event, '', '')
    );
  }
}
