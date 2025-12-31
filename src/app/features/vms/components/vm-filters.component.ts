import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VmStoreService } from '../../../core/services/vm-store.service';

@Component({
  selector: 'app-vm-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vm-filters.component.html',
  styleUrl: './vm-filters.component.scss'
})
export class VmFiltersComponent {
  filters$;
  projects$;

  constructor(private readonly store: VmStoreService) {
    this.filters$ = this.store.filters$;
    this.projects$ = this.store.projects$;
  }

  updateStatus(value: string) {
    this.store.setStatusFilter(value as any);
  }

  updateProject(value: string) {
    this.store.setProjectFilter(value);
  }

  exportVms() {
    this.store.exportVms();
  }
}
