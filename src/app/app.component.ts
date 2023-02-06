import 'core-js';

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { IdleService } from '@core/services/idle.service';
import { NestedRoutesService } from '@core/services/nested-routes.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { Angulartics2GoogleTagManager } from 'angulartics2/gtm';
import { filter, take, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private baseTitle = 'Skills for Care';
  public isAdminSection = false;
  public dashboardView = false;
  public standAloneAccount = false;
  @ViewChild('top') top: ElementRef;
  @ViewChild('content') content: ElementRef;

  constructor(
    private router: Router,
    private title: Title,
    private nestedRoutesService: NestedRoutesService,
    private authService: AuthService,
    private idleService: IdleService,
    private angulartics2GoogleTagManager: Angulartics2GoogleTagManager,
    private featureFlagsService: FeatureFlagsService,
    private establishmentService: EstablishmentService,
  ) {
    this.nestedRoutesService.routes$.subscribe((routes) => {
      if (routes) {
        const titles = routes.reduce(
          (titleArray, breadcrumb) => {
            titleArray.push(breadcrumb.title);
            return titleArray;
          },
          [this.baseTitle],
        );

        this.title.setTitle(titles.join(' - '));
      }
    });

    this.angulartics2GoogleTagManager.startTracking();
    this.featureFlagsService.start();
  }

  ngOnInit(): void {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((nav: NavigationEnd) => {
      this.isAdminSection = nav.url.includes('sfcadmin');
      this.dashboardView = nav.url.includes('dashboard');

      this.checkIfStandAloneAccount();
      // console.log('****************');
      // console.log(this.route.snapshot);
      // this.dashboardView = nav.url.includes(
      //   '#home' || '#workplace' || '#staff-records' || '#training-and-qualifications' || '#benchmarks',
      // );
      window.scrollTo(0, 0);
      if (document.activeElement && document.activeElement !== document.body) {
        (document.activeElement as HTMLElement).blur();
      }
      this.top.nativeElement.focus();
    });

    this.authService.isAutheticated$.subscribe((authenticated) => {
      if (authenticated) {
        this.idleService.start();

        this.idleService.ping$.pipe(takeWhile(() => this.idleService.isRunning)).subscribe(() => {
          this.authService.refreshToken().pipe(take(1)).subscribe();
        });

        this.idleService.onTimeout().subscribe(() => {
          this.authService.storeRedirectLocation();
          this.authService.logout();
        });
      } else if (this.idleService.isRunning) {
        this.idleService.clear();
      }
    });
  }

  private checkIfStandAloneAccount(): void {
    const workplace = this.establishmentService.primaryWorkplace;
    this.standAloneAccount = !(workplace?.isParent || workplace?.parentUid);
    console.log('standAloneAccount:', this.standAloneAccount);
  }

  public skip(event: Event) {
    event.preventDefault();
    this.content.nativeElement.focus();
  }
}
