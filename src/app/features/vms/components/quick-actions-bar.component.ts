import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VmStoreService } from '../../../core/services/vm-store.service';

@Component({
  selector: 'app-quick-actions-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-actions-bar.component.html',
  styleUrl: './quick-actions-bar.component.scss'
})
export class QuickActionsBarComponent {
  selectedCount$;
  filters$;

  constructor(private readonly store: VmStoreService) {
    this.selectedCount$ = this.store.selectedCount$;
    this.filters$ = this.store.filters$;
  }

  openRequest() {
    this.store.openRequestModal();
  }

  bulkExtend() {
    this.runAction('extend');
  }

  bulkRestart() {
    this.runAction('restart');
  }

  bulkStop() {
    this.runAction('stop');
  }

  bulkDelete() {
    this.runAction('delete');
  }

  private runAction(action: 'extend' | 'restart' | 'stop' | 'delete') {
    const selected = Array.from(this.store.stateSnapshot.selectedIds);
    this.store.runAction(action, selected);
  }
}
