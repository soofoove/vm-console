import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { VmStoreService } from '../core/services/vm-store.service';
import { ThemeService, ThemeMode } from '../core/services/theme.service';
import { BootstrapService } from '../core/services/bootstrap.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [FormsModule, AsyncPipe],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit, OnDestroy {
  @ViewChild('userDropdownToggle', { static: true }) userDropdownToggle?: ElementRef<HTMLButtonElement>;

  pageTitle = 'Дашборд';
  pageSubtitle = 'Запуск/остановка, TTL, квоты, заявки на новые ВМ.';
  search = '';
  scope: 'all' | 'active' | 'expiring' = 'all';
  theme: ThemeMode = 'light';
  unreadCount$;

  private readonly subscriptions = new Subscription();

  constructor(
    private readonly store: VmStoreService,
    private readonly router: Router,
    private readonly themeService: ThemeService,
    private readonly bootstrapService: BootstrapService
  ) {
    this.unreadCount$ = this.store.unreadNotificationsCount$;
  }

  ngOnInit() {
    this.theme = this.themeService.loadTheme();
    this.themeService.applyTheme(this.theme);

    this.subscriptions.add(
      this.store.filters$.subscribe((filters) => {
        this.search = filters.search;
        this.scope = filters.scope;
      })
    );

    this.updateTitle(this.router.url);
    this.subscriptions.add(this.router.events.subscribe(() => this.updateTitle(this.router.url)));

    if (this.userDropdownToggle) {
      this.bootstrapService.initDropdown(this.userDropdownToggle.nativeElement);
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  setScope(scope: 'all' | 'active' | 'expiring') {
    this.store.setScope(scope);
  }

  onSearchChange() {
    this.store.setSearch(this.search);
  }

  onSearchFocus() {
    if (this.router.url.startsWith('/dashboard')) {
      this.router.navigate(['/vms']);
    }
  }

  setTheme(theme: ThemeMode) {
    this.theme = theme;
    this.themeService.applyTheme(theme);
  }

  mockLogin() {
    this.store.addEvent('Mock: user switched', '', '');
    this.store.showToast('Mock: переключили пользователя', 'info');
  }

  exportEvents() {
    this.store.exportEvents();
  }

  private updateTitle(url: string) {
    const titleMap: Record<string, [string, string]> = {
      '/dashboard': ['Дашборд', 'Сводка: KPI и уведомления.'],
      '/vms': ['Мои ВМ', 'Список, фильтры, TTL и быстрые операции.'],
      '/request': ['Запросить новую', 'Форма создания ВМ (mock)'],
      '/events': ['События / Логи', 'Журнал действий, которые ты кликаешь.'],
      '/settings': ['Настройки', 'Переключатели и квоты (mock).']
    };
    const matched = Object.entries(titleMap).find(([route]) => url.startsWith(route));
    if (matched) {
      [this.pageTitle, this.pageSubtitle] = matched[1];
    }
  }
}
