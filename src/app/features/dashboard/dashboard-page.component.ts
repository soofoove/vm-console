import { Component } from '@angular/core';
import { KpiCardsComponent } from './components/kpi-cards.component';
import { NoticeListComponent } from './components/notice-list.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [KpiCardsComponent, NoticeListComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent {}
