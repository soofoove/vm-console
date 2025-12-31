import { Component } from '@angular/core';
import { EventsTableComponent } from './components/events-table.component';
import { EventsService } from '../../core/services/events.service';

@Component({
  selector: 'app-events-page',
  standalone: true,
  imports: [EventsTableComponent],
  templateUrl: './events-page.component.html',
  styleUrl: './events-page.component.scss'
})
export class EventsPageComponent {
  constructor(private readonly eventsService: EventsService) {}

  clearEvents() {
    this.eventsService.clearEvents();
  }

  seedEvents() {
    this.eventsService.seedEvents();
  }
}
