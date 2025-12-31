import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmRequest {
  title: string;
  body: string;
  resolve: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly requestsSubject = new Subject<ConfirmRequest>();
  readonly requests$ = this.requestsSubject.asObservable();

  confirm(title: string, body: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.requestsSubject.next({ title, body, resolve });
    });
  }
}
