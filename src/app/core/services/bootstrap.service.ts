import { Injectable } from '@angular/core';

declare const bootstrap: {
  Modal: {
    getOrCreateInstance: (element: Element) => { show: () => void; hide: () => void };
  };
  Offcanvas: {
    getOrCreateInstance: (element: Element) => { show: () => void; hide: () => void };
  };
  Dropdown: new (element: Element, options?: { popperConfig?: { strategy: string } }) => unknown;
};

@Injectable({ providedIn: 'root' })
export class BootstrapService {
  showModal(element: Element) {
    bootstrap.Modal.getOrCreateInstance(element).show();
  }

  hideModal(element: Element) {
    bootstrap.Modal.getOrCreateInstance(element).hide();
  }

  showOffcanvas(element: Element) {
    bootstrap.Offcanvas.getOrCreateInstance(element).show();
  }

  hideOffcanvas(element: Element) {
    bootstrap.Offcanvas.getOrCreateInstance(element).hide();
  }

  initDropdown(element: Element) {
    return new bootstrap.Dropdown(element, { popperConfig: { strategy: 'fixed' } });
  }

  initDropdowns(elements: Element[]) {
    elements.forEach((element) => this.initDropdown(element));
  }
}
