import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastKind = 'info' | 'ok' | 'warn' | 'danger';

export interface ToastMessage {
  id: string;
  message: string;
  kind: ToastKind;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly messagesSubject = new BehaviorSubject<ToastMessage[]>([]);
  readonly messages$ = this.messagesSubject.asObservable();

  show(message: string, kind: ToastKind = 'info') {
    const id = crypto.randomUUID();
    const next = [...this.messagesSubject.value, { id, message, kind }];
    this.messagesSubject.next(next);
    setTimeout(() => this.dismiss(id), 3200);
  }

  dismiss(id: string) {
    this.messagesSubject.next(this.messagesSubject.value.filter((toast) => toast.id !== id));
  }
}
