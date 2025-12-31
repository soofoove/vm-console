import { Component } from '@angular/core';
import { AsyncPipe, NgFor, NgIf, SlicePipe } from '@angular/common';
import { VmStoreService } from '../core/services/vm-store.service';
import { formatDate } from '../core/utils/vm-utils';

@Component({
  selector: 'app-notifications-offcanvas',
  standalone: true,
  imports: [NgFor, NgIf, AsyncPipe, SlicePipe],
  templateUrl: './notifications-offcanvas.component.html',
  styleUrl: './notifications-offcanvas.component.scss'
})
export class NotificationsOffcanvasComponent {
  notifications$;
  formatDate = formatDate;

  constructor(private readonly store: VmStoreService) {
    this.notifications$ = this.store.notifications$;
  }

  markAllRead() {
    this.store.markAllNotificationsRead();
  }

  clearNotifications() {
    this.store.clearNotifications();
  }

  markRead(id: string) {
    this.store.markNotificationRead(id);
  }

  openVm(vmId: string | null) {
    if (!vmId) return;
    this.store.openVmDetails(vmId);
  }
}
