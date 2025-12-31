import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { Subscription, combineLatest, map } from 'rxjs';
import { VmStoreService } from '../../../core/services/vm-store.service';
import { BootstrapService } from '../../../core/services/bootstrap.service';
import { Vm } from '../../../core/models/vm.models';
import { computeTtl, formatDate } from '../../../core/utils/vm-utils';

@Component({
  selector: 'app-vm-details-modal',
  standalone: true,
  imports: [AsyncPipe, NgIf],
  templateUrl: './vm-details-modal.component.html',
  styleUrl: './vm-details-modal.component.scss'
})
export class VmDetailsModalComponent implements OnInit, OnDestroy {
  @ViewChild('modal', { static: true }) modal?: ElementRef<HTMLDivElement>;

  vm$;
  formatDate = formatDate;

  private readonly subscriptions = new Subscription();

  constructor(private readonly store: VmStoreService, private readonly bootstrapService: BootstrapService) {
    this.vm$ = combineLatest([this.store.vms$, this.store.activeVmId$]).pipe(
      map(([vms, id]) => vms.find((vm) => vm.id === id) || null)
    );
  }

  ngOnInit() {
    this.subscriptions.add(
      this.store.activeVmId$.subscribe((id) => {
        if (id && this.modal) {
          this.bootstrapService.showModal(this.modal.nativeElement);
        }
      })
    );

    if (this.modal) {
      this.modal.nativeElement.addEventListener('hidden.bs.modal', () => this.store.closeVmDetails());
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  ttlLeft(vm: Vm) {
    const ttl = computeTtl(vm);
    if (ttl.expired) {
      return 'истёк';
    }
    if (ttl.leftHours < 1) {
      return `~ ${Math.max(1, Math.round(ttl.leftHours * 60))}м`;
    }
    return `~ ${Math.round(ttl.leftHours)}ч`;
  }

  extend(vm: Vm) {
    this.store.runAction('extend', [vm.id]);
  }

  shorten(vm: Vm) {
    this.store.shortenTtl(vm);
  }

  refresh(vm: Vm) {
    this.ttlLeft(vm);
    this.store.showToast('Обновлено', 'info');
  }

  start(vm: Vm) {
    this.store.runAction('start', [vm.id]);
  }

  stop(vm: Vm) {
    this.store.runAction('stop', [vm.id]);
  }

  restart(vm: Vm) {
    this.store.runAction('restart', [vm.id]);
  }

  copySsh(vm: Vm) {
    this.store.runAction('copyssh', [vm.id]);
  }

  delete(vm: Vm) {
    this.store.runAction('delete', [vm.id]);
  }
}
