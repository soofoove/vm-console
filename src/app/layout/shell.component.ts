import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';
import { NotificationsOffcanvasComponent } from './notifications-offcanvas.component';
import { VmDetailsModalComponent } from '../features/vms/components/vm-details-modal.component';
import { RequestVmModalComponent } from '../features/vms/components/request-vm-modal.component';
import { ConfirmModalComponent } from './confirm-modal.component';
import { ToastHostComponent } from './toast-host.component';
import { AutoRefreshService } from '../core/services/auto-refresh.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    TopbarComponent,
    NotificationsOffcanvasComponent,
    VmDetailsModalComponent,
    RequestVmModalComponent,
    ConfirmModalComponent,
    ToastHostComponent
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  constructor(autoRefreshService: AutoRefreshService) {
    autoRefreshService.start();
  }
}
