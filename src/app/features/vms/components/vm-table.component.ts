import { Component } from '@angular/core';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { VmStoreService } from '../../../core/services/vm-store.service';
import { VmRowActionsComponent } from './vm-row-actions.component';
import { Vm } from '../../../core/models/vm.models';
import { formatDate, statusMeta, ttlLabel } from '../../../core/utils/vm-utils';

@Component({
  selector: 'app-vm-table',
  standalone: true,
  imports: [AsyncPipe, NgClass, NgFor, NgIf, VmRowActionsComponent],
  templateUrl: './vm-table.component.html',
  styleUrl: './vm-table.component.scss'
})
export class VmTableComponent {
  pagedVms$;
  selectedIds$;
  isAllVisibleSelected$;
  formatDate = formatDate;
  statusMeta = statusMeta;
  ttlLabel = ttlLabel;

  constructor(private readonly store: VmStoreService) {
    this.pagedVms$ = this.store.pagedVms$;
    this.selectedIds$ = this.store.selectedIds$;
    this.isAllVisibleSelected$ = this.store.isAllVisibleSelected$;
  }

  toggleSelect(vm: Vm, selected: boolean) {
    this.store.toggleVmSelection(vm.id, selected);
  }

  toggleSelectAll(vms: Vm[]) {
    this.store.toggleSelectAllVisible(vms);
  }

  openDetails(vm: Vm) {
    this.store.openVmDetails(vm.id);
  }
}
