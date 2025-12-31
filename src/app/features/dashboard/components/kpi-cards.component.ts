import { Component } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { VmStoreService } from '../../../core/services/vm-store.service';

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [AsyncPipe, NgIf],
  templateUrl: './kpi-cards.component.html',
  styleUrl: './kpi-cards.component.scss'
})
export class KpiCardsComponent {
  kpi$;

  constructor(private readonly store: VmStoreService) {
    this.kpi$ = this.store.kpi$;
  }
}
