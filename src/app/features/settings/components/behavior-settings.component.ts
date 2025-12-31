import { Component } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VmStoreService } from '../../../core/services/vm-store.service';

@Component({
  selector: 'app-behavior-settings',
  standalone: true,
  imports: [AsyncPipe, NgIf, FormsModule],
  templateUrl: './behavior-settings.component.html',
  styleUrl: './behavior-settings.component.scss'
})
export class BehaviorSettingsComponent {
  settings$;

  constructor(private readonly store: VmStoreService) {
    this.settings$ = this.store.settings$;
  }

  updateAutoRefresh(value: boolean) {
    this.store.updateSettings({ autoRefresh: value });
  }

  updateToasts(value: boolean) {
    this.store.updateSettings({ toasts: value });
  }
}
