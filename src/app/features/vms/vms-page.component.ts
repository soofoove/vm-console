import { Component } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { VmStoreService } from '../../core/services/vm-store.service';
import { QuickActionsBarComponent } from './components/quick-actions-bar.component';
import { VmFiltersComponent } from './components/vm-filters.component';
import { VmTableComponent } from './components/vm-table.component';

@Component({
  selector: 'app-vms-page',
  standalone: true,
  imports: [AsyncPipe, NgIf, QuickActionsBarComponent, VmFiltersComponent, VmTableComponent],
  templateUrl: './vms-page.component.html',
  styleUrl: './vms-page.component.scss'
})
export class VmsPageComponent {
  pageInfo$;
  totalVms$;
  filteredCount$;

  constructor(private readonly store: VmStoreService) {
    this.pageInfo$ = this.store.pageInfo$;
    this.totalVms$ = this.store.totalVms$;
    this.filteredCount$ = this.store.filteredCount$;
  }

  prevPage(pageIndex: number) {
    this.store.setPageIndex(pageIndex - 1);
  }

  nextPage(pageIndex: number) {
    this.store.setPageIndex(pageIndex + 1);
  }
}
