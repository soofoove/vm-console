import { Injectable } from '@angular/core';
import { VmStoreService } from './vm-store.service';

@Injectable({ providedIn: 'root' })
export class AutoRefreshService {
  private timer: number | null = null;

  constructor(private readonly store: VmStoreService) {}

  start() {
    if (this.timer !== null) {
      return;
    }
    this.timer = window.setInterval(() => {
      const settings = this.store.settingsSnapshot;
      if (!settings.autoRefresh) {
        return;
      }
      this.store.runAutoRefreshTick();
    }, 5000);
  }
}
