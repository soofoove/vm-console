import { Routes } from '@angular/router';
import { DashboardPageComponent } from './features/dashboard/dashboard-page.component';
import { VmsPageComponent } from './features/vms/vms-page.component';
import { RequestPageComponent } from './features/vms/request-page.component';
import { EventsPageComponent } from './features/events/events-page.component';
import { SettingsPageComponent } from './features/settings/settings-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardPageComponent },
  { path: 'vms', component: VmsPageComponent },
  { path: 'request', component: RequestPageComponent },
  { path: 'events', component: EventsPageComponent },
  { path: 'settings', component: SettingsPageComponent }
];
