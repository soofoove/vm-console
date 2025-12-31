import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { VmStoreService } from '../../../core/services/vm-store.service';
import { BootstrapService } from '../../../core/services/bootstrap.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-request-vm-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './request-vm-modal.component.html',
  styleUrl: './request-vm-modal.component.scss'
})
export class RequestVmModalComponent implements OnInit, OnDestroy {
  @ViewChild('modal', { static: true }) modal?: ElementRef<HTMLDivElement>;

  name = '';
  project = '';
  template = 'Ubuntu 24.04 + Docker';
  ttlHours = 24;
  cpu = 2;
  ram = 4;
  disk = 60;
  ssh = '';
  comment = '';

  private readonly subscriptions = new Subscription();

  constructor(
    private readonly store: VmStoreService,
    private readonly bootstrapService: BootstrapService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.store.requestModal$.subscribe((open) => {
        if (open && this.modal) {
          this.bootstrapService.showModal(this.modal.nativeElement);
        }
      })
    );
    if (this.modal) {
      this.modal.nativeElement.addEventListener('hidden.bs.modal', () => this.store.closeRequestModal());
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  submit() {
    const safeProject = (this.project.trim().split(/[^\w]+/)[0] || 'dev').toLowerCase();
    const safeName =
      this.name.trim() ||
      `vm-${safeProject}-${String(Math.floor(Math.random() * 90) + 10).padStart(2, '0')}`;
    this.store.submitRequest({
      name: safeName,
      project: safeProject,
      template: this.template,
      ttlHours: this.ttlHours,
      cpu: this.cpu,
      ram: this.ram,
      disk: this.disk
    });
    this.reset();
    if (this.modal) {
      this.bootstrapService.hideModal(this.modal.nativeElement);
    }
    this.router.navigate(['/vms']);
  }

  private reset() {
    this.name = '';
    this.project = '';
    this.template = 'Ubuntu 24.04 + Docker';
    this.ttlHours = 24;
    this.cpu = 2;
    this.ram = 4;
    this.disk = 60;
    this.ssh = '';
    this.comment = '';
  }
}
