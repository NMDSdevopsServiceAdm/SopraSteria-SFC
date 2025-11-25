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
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { filter, take, takeWhile } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: false
})
export class AppComponent implements OnInit {
  private baseTitle = 'Skills for Care';
  public isAdminSection = false;
  public dashboardView = false;
  public standAloneAccount = false;
  public newDataAreaFlag: boolean;
  public parentAccount: boolean;
  public subsAccount: boolean;
  public viewingSubsidiaryWorkplace: boolean;
  public showHelpButton: boolean;
  @ViewChild('top') top: ElementRef;
  @ViewChild('content') content: ElementRef;

  constructor(
    private router: Router,
    private title: Title,
    private nestedRoutesService: NestedRoutesService,
    private authService: AuthService,
    private idleService: IdleService,
    private featureFlagsService: FeatureFlagsService,
    private establishmentService: EstablishmentService,
    private tabsService: TabsService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
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
  }

  async ngOnInit(): Promise<void> {
    await this.featureFlagsService.start();

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((nav: NavigationEnd) => {
      this.isAdminSection = this.isInAdminSection(nav.url);
      this.dashboardView =
        nav.url.includes('dashboard') ||
        nav.url === '/' ||
        this.parentSubsidiaryViewService.getViewingSubAsParentDashboard(nav.url);

      if (nav.url === '/') this.tabsService.selectedTab = 'home';
      this.standAloneAccount = this.establishmentService.standAloneAccount;
      this.parentAccount = this.establishmentService.primaryWorkplace?.isParent;
      this.subsAccount = this.establishmentService.primaryWorkplace?.parentName ? true : false;
      this.viewingSubsidiaryWorkplace = nav.url.includes('subsidiary');

      window.scrollTo(0, 0);
      if (document.activeElement && document.activeElement !== document.body) {
        (document.activeElement as HTMLElement).blur();
      }
      this.top.nativeElement.focus();

      this.renderHelpButton(nav.url);
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

    await this.featureFlagsService.configCatClient.forceRefreshAsync();
  }

  public skip(event: Event) {
    event.preventDefault();
    this.content.nativeElement.focus();
  }

  private renderHelpButton(url: string): void {
    if (!this.authService.isAuthenticated() || this.isInAdminSection(url) || this.isInHelpSection(url)) {
      this.showHelpButton = false;
    } else {
      this.showHelpButton = true;
    }
  }

  private isInHelpSection(url: string): boolean {
    const urlSegments = url.split('/');
    return urlSegments?.[1] === 'help' || (urlSegments?.[1] === 'subsidiary' && urlSegments?.[2] === 'help');
  }

  private isInAdminSection(url: string): boolean {
    return url.includes('sfcadmin');
  }
}
