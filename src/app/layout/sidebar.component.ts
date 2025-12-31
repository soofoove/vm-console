import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { VmStoreService } from '../core/services/vm-store.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  constructor(private readonly store: VmStoreService) {}

  seedVms() {
    this.store.seedVms(4);
  }

  openRequest() {
    this.store.openRequestModal();
  }
}
