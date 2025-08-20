import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TabsService } from './tabs.service';

@Injectable({
  providedIn: 'root',
})
export class SortByService {
  constructor(private router: Router, private tabsService: TabsService) {
    this.router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe((event: NavigationStart) => {
      const destinationUrl = event.url;

      if (!destinationUrl.includes('staff-record')) {
        this.clearLocalStorageForSort();
      }
    });

    this.tabsService.selectedTab$.subscribe((newTab) => {
      if (newTab && newTab !== 'staff-records') {
        this.clearLocalStorageForSort();
      }
    });
  }

  public clearLocalStorageForSort() {
    localStorage.removeItem('staffSummarySortValue');
    localStorage.removeItem('staffSummarySearchTerm');
    localStorage.removeItem('staffSummaryIndex');
  }

  public returnLocalStorageForSort(): any {
    return {
      staffSummarySortValue: localStorage.getItem('staffSummarySortValue') ?? null,
      staffSummarySearchTerm: localStorage.getItem('staffSummarySearchTerm') ?? null,
      staffSummaryIndex: localStorage.getItem('staffSummaryIndex') ?? null,
    };
  }
}
