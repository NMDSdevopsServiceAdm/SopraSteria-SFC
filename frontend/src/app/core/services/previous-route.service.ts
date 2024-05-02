import { Injectable } from '@angular/core';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PreviousRouteService {
  public previousUrl: string;
  private currentUrl: string;

  constructor(private router: Router) {
    this.currentUrl = this.router.url;
    this.previousUrl = null;

    this.router.events
      .pipe(filter((event: RouterEvent) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.urlAfterRedirects;
      });
  }

  public setPreviousTab(url: string) {
    this.previousUrl = url;
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
