import { Injectable } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class ClipboardService {
  constructor(private readonly toastService: ToastService) {}

  async copy(text: string, okMessage = 'Скопировано') {
    try {
      await navigator.clipboard.writeText(text);
      this.toastService.show(okMessage, 'ok');
      return;
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
      this.toastService.show(okMessage, 'ok');
    }
  }
}
