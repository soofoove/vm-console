import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VmStoreService } from '../../../core/services/vm-store.service';
import { formatDate, statusMeta } from '../../../core/utils/vm-utils';

@Component({
  selector: 'app-events-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './events-table.component.html',
  styleUrl: './events-table.component.scss'
})
export class EventsTableComponent {
  events$;
  formatDate = formatDate;
  statusMeta = statusMeta;

  constructor(private readonly store: VmStoreService) {
    this.events$ = this.store.events$;
  }
}
