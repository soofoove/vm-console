import { Component } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { VmStoreService } from '../../../core/services/vm-store.service';

@Component({
  selector: 'app-quota-settings',
  standalone: true,
  imports: [AsyncPipe, NgIf],
  templateUrl: './quota-settings.component.html',
  styleUrl: './quota-settings.component.scss'
})
export class QuotaSettingsComponent {
  settings$;

  constructor(private readonly store: VmStoreService) {
    this.settings$ = this.store.settings$;
  }

  updateQuota(value: string) {
    this.store.updateSettings({ cpuQuota: Number(value) });
  }
}
