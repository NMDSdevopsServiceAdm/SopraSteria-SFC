import 'core-js';

import { Component, ElementRef, enableProdMode, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { IdleService } from '@core/services/idle.service';
import { NestedRoutesService } from '@core/services/nested-routes.service';
import { Angulartics2GoogleTagManager } from 'angulartics2/gtm';
import { filter, take, takeWhile } from 'rxjs/operators';

enableProdMode();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private baseTitle = 'Skills for Care';
  @ViewChild('top', { static: false }) top: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;

  constructor(
    private router: Router,
    private title: Title,
    private nestedRoutesService: NestedRoutesService,
    private authService: AuthService,
    private idleService: IdleService,
    private angulartics2GoogleTagManager: Angulartics2GoogleTagManager
  ) {
    this.nestedRoutesService.routes$.subscribe(routes => {
      if (routes) {
        const titles = routes.reduce(
          (titleArray, breadcrumb) => {
            titleArray.push(breadcrumb.title);
            return titleArray;
          },
          [this.baseTitle]
        );

        this.title.setTitle(titles.join(' - '));
      }
    });

    angulartics2GoogleTagManager.startTracking();
  }

  ngOnInit() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      window.scrollTo(0, 0);
      if (document.activeElement && document.activeElement !== document.body) {
        (document.activeElement as HTMLElement).blur();
      }
      this.top.nativeElement.focus();
    });

    this.authService.isAutheticated$.subscribe(authenticated => {
      if (authenticated) {
        this.idleService.start();

        this.idleService.ping$.pipe(takeWhile(() => this.idleService.isRunning)).subscribe(() => {
          this.authService
            .refreshToken()
            .pipe(take(1))
            .subscribe();
        });

        this.idleService.onTimeout().subscribe(() => {
          this.authService.storeRedirectLocation();
          this.authService.logout();
        });
      } else if (!authenticated && this.idleService.isRunning) {
        this.idleService.clear();
      }
    });
  }

  public skip(event: Event) {
    event.preventDefault();
    this.content.nativeElement.focus();
  }
}
