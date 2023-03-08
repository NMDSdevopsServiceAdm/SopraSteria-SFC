import 'core-js';

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { IdleService } from '@core/services/idle.service';
import { NestedRoutesService } from '@core/services/nested-routes.service';
import { TabsService } from '@core/services/tabs.service';
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
  public newHomeDesignFlag: boolean;
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
    private tabsService: TabsService,
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

  async ngOnInit(): Promise<void> {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((nav: NavigationEnd) => {
      console.log('****** navigation event *********');
      console.log(nav.url);
      this.isAdminSection = nav.url.includes('sfcadmin');
      this.dashboardView = nav.url.includes('dashboard') || nav.url === '/';
      if (nav.url === '/') this.tabsService.selectedTab = 'home';
      this.standAloneAccount = this.establishmentService.standAloneAccount;

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

    this.newHomeDesignFlag = await this.featureFlagsService.configCatClient.getValueAsync('homePageNewDesign', false);
    this.featureFlagsService.newHomeDesignFlag = this.newHomeDesignFlag;
  }

  public skip(event: Event) {
    event.preventDefault();
    this.content.nativeElement.focus();
  }
}
