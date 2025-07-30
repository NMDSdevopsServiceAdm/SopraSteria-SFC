import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TabsService } from './tabs.service';

@Injectable({
  providedIn: 'root',
})
export class SortByService {
  public navUrl: string;
  private _totalWorkerCount: number;

  constructor(private router: Router, private tabsService: TabsService) {
    this.navUrl;

    this.router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe((event: NavigationStart) => {
      console.log(event);

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

  public setInitialTotalWorkerCount(totalWorkerCount: number) {
    this._totalWorkerCount = totalWorkerCount;
  }

  public getInitialTotalWorkerCount() {
    return this._totalWorkerCount;
  }
}
