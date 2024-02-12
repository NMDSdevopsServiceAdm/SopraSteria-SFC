import { Injectable } from '@angular/core';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: "root"
})
export class PreviousRouteService {

  private previousUrl: string;
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

  public getPreviousUrl() {
    return this.previousUrl;
  }

  // all-workplaces/about-parents
  // dashboard#home
  public getPreviousPage() {
    let previousPage = this.previousUrl;
    if(previousPage) {
      const regexSplit = /\/|\#/
      //split the url by slashes or hashes
      let previousPages = previousPage.split(regexSplit);
      // take the end of the url and remove dashes from the name
      previousPage = previousPages[previousPages.length - 1]
        .split("-")
        .join(" ");
    }
    return previousPage;
  }
};