import { Component } from '@angular/core';
import { VmStoreService } from '../../core/services/vm-store.service';

@Component({
  selector: 'app-request-page',
  standalone: true,
  templateUrl: './request-page.component.html',
  styleUrl: './request-page.component.scss'
})
export class RequestPageComponent {
  constructor(private readonly store: VmStoreService) {}

  openRequest() {
    this.store.openRequestModal();
  }
}
