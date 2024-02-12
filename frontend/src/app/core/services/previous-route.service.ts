import { Injectable } from '@angular/core';
import { Router, NavigationEnd, RoutesRecognized } from '@angular/router';
import {filter, pairwise } from 'rxjs/operators';

@Injectable()
export class PreviousRouteService {

  private previousUrl: string;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((evt: any) => evt instanceof RoutesRecognized), pairwise())
      .subscribe((events: RoutesRecognized[]) => {
        this.previousUrl = events[0].urlAfterRedirects;
        console.log('previous url', this.previousUrl);
      });
  }

  public getPreviousUrl() {
    return this.previousUrl;
  }
 }