import { Component } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { VmStoreService } from '../../../core/services/vm-store.service';
import { formatDate } from '../../../core/utils/vm-utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notice-list',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgIf],
  templateUrl: './notice-list.component.html',
  styleUrl: './notice-list.component.scss'
})
export class NoticeListComponent {
  notices$;
  formatDate = formatDate;

  constructor(private readonly store: VmStoreService, private readonly router: Router) {
    this.notices$ = this.store.noticeList$;
  }

  goToVms() {
    this.router.navigate(['/vms']);
  }

  clearNotices() {
    this.store.markNoticesRead();
  }

  markNoticeRead(id: string) {
    this.store.markNotificationRead(id);
    this.store.showToast('Отмечено как прочитанное', 'ok');
  }
}
