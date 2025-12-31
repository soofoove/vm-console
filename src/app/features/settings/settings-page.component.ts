import { Component } from '@angular/core';
import { BehaviorSettingsComponent } from './components/behavior-settings.component';
import { QuotaSettingsComponent } from './components/quota-settings.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [BehaviorSettingsComponent, QuotaSettingsComponent],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss'
})
export class SettingsPageComponent {}
