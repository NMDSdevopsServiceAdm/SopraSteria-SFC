import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PreviousRouteService {
  public previousUrl: string;
  private currentUrl: string;
  private lastSelectedTab: string;

  constructor(private router: Router) {
    this.currentUrl = this.router.url;
    this.previousUrl = null;

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.previousUrl = this.currentUrl;

      if (this.previousUrl.includes('dashboard')) {
        this.previousUrl = this.lastSelectedTab;
      }

      this.currentUrl = event.urlAfterRedirects;
    });
  }

  public setLastSelectedTab(tab: string) {
    this.lastSelectedTab = tab;
  }

  public getPreviousUrl() {
    return this.previousUrl;
  }

  public getPreviousPage() {
    let previousPage = null;
    if (this.previousUrl) {
      const regexSplit = /\/|\#/;

      let previousPages = this.previousUrl.split(regexSplit);

      previousPage = previousPages[previousPages.length - 1];
    }
    return previousPage;
  }
}
