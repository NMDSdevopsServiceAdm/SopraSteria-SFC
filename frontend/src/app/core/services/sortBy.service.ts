import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TabsService } from './tabs.service';

@Injectable({
  providedIn: 'root',
})
export class SortByService {
  public navUrl: string;

  constructor(private router: Router, private tabsService: TabsService) {
    this.navUrl;

    this.router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe((event: NavigationStart) => {
      const destinationUrl = event.url;

      if (!destinationUrl.includes('staff-record')) {
        this.clearLocalStorage();
      }
    });

    this.tabsService.selectedTab$.subscribe((newTab) => {
      if (newTab && newTab !== 'staff-records') {
        this.clearLocalStorage();
      }
    });
  }

  public clearLocalStorage() {
    localStorage.removeItem('staffSummarySortValue');
    localStorage.removeItem('staffSummarySearchTerm');
    localStorage.removeItem('staffSummaryIndex');
    localStorage.removeItem('isSearchMaintained');
  }
}
