import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Vm } from '../../../core/models/vm.models';
import { VmStoreService } from '../../../core/services/vm-store.service';
import { BootstrapService } from '../../../core/services/bootstrap.service';

@Component({
  selector: 'app-vm-row-actions',
  standalone: true,
  templateUrl: './vm-row-actions.component.html',
  styleUrl: './vm-row-actions.component.scss'
})
export class VmRowActionsComponent implements OnInit {
  @Input({ required: true }) vm!: Vm;
  @ViewChild('dropdownToggle', { static: true }) dropdownToggle?: ElementRef<HTMLButtonElement>;

  constructor(
    private readonly store: VmStoreService,
    private readonly bootstrapService: BootstrapService
  ) {}

  ngOnInit() {
    if (this.dropdownToggle) {
      this.bootstrapService.initDropdown(this.dropdownToggle.nativeElement);
    }
  }

  openDetails() {
    this.store.openVmDetails(this.vm.id);
  }

  runAction(action: 'extend' | 'restart' | 'start' | 'stop' | 'copyssh' | 'delete') {
    this.store.runAction(action, [this.vm.id]);
  }
}
