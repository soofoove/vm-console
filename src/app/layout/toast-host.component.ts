import { Component } from '@angular/core';
import { AsyncPipe, NgFor, NgStyle } from '@angular/common';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [NgFor, AsyncPipe, NgStyle],
  templateUrl: './toast-host.component.html',
  styleUrl: './toast-host.component.scss'
})
export class ToastHostComponent {
  messages$;

  constructor(private readonly toastService: ToastService) {
    this.messages$ = this.toastService.messages$;
  }

  dismiss(id: string) {
    this.toastService.dismiss(id);
  }

  toastStyle(kind: string) {
    const background = {
      info: 'rgba(255,255,255,.92)',
      ok: 'rgba(52,199,89,.18)',
      warn: 'rgba(255,159,10,.18)',
      danger: 'rgba(255,59,48,.16)'
    }[kind];

    const border = {
      info: 'rgba(60,60,67,.18)',
      ok: 'rgba(52,199,89,.30)',
      warn: 'rgba(255,159,10,.35)',
      danger: 'rgba(255,59,48,.28)'
    }[kind];

    return {
      background,
      border: `1px solid ${border}`
    };
  }
}
