import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmRequest, ConfirmService } from '../core/services/confirm.service';
import { BootstrapService } from '../core/services/bootstrap.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss'
})
export class ConfirmModalComponent implements OnInit, OnDestroy {
  @ViewChild('modal', { static: true }) modal?: ElementRef<HTMLDivElement>;

  title = 'Подтвердите';
  body = '…';
  private request?: ConfirmRequest;
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly confirmService: ConfirmService,
    private readonly bootstrapService: BootstrapService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.confirmService.requests$.subscribe((request) => {
        this.request = request;
        this.title = request.title;
        this.body = request.body;
        if (this.modal) {
          this.bootstrapService.showModal(this.modal.nativeElement);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  cancel() {
    this.resolve(false);
  }

  confirm() {
    this.resolve(true);
  }

  private resolve(value: boolean) {
    if (this.modal) {
      this.bootstrapService.hideModal(this.modal.nativeElement);
    }
    if (this.request) {
      this.request.resolve(value);
      this.request = undefined;
    }
  }
}
