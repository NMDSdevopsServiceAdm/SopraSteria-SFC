import { Location } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Tab, TabsService, UrlPartsRelatedToTabs } from '@core/services/tabs.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-new-tabs',
  templateUrl: './new-tabs.component.html',
  styleUrls: ['./new-tabs.component.scss'],
})
export class NewTabsComponent implements OnInit, OnDestroy {
  @Output() selectedTabClick = new EventEmitter<{ tabSlug: string }>();
  @Input() tabs: Tab[];
  @Input() dashboardView: boolean;

  private currentTab: number;
  private subscriptions: Subscription = new Subscription();
  private focus: boolean;
  private clickEvent: boolean;
  public isParentViewingSub: boolean;

  @ViewChild('tablist') tablist: ElementRef;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    public tabsService: TabsService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.isParentViewingSub = this.parentSubsidiaryViewService.getViewingSubAsParent();

    this.selectedTabSubscription();
    this.setTabOnInit();
    this.trackRouterEventsToSetTab();
  }

  private trackRouterEventsToSetTab(): void {
    this.subscriptions.add(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((route: NavigationEnd) => this.handleNavigationEvent(route)),
    );
  }

  private handleNavigationEvent(route: NavigationEnd): void {
    let handledDashboardTabChange = false;

    if (this.isParentViewingSub) {
      handledDashboardTabChange = this.handleSubsidiaryTabChange(route);
    } else {
      handledDashboardTabChange = this.handleMainDashboardTabChange(route);
    }

    if (!handledDashboardTabChange) {
      this.handleNavigationOfNonDashboardPages(route);
    }
  }

  private handleMainDashboardTabChange(route: NavigationEnd): boolean {
    const tabSlugInUrl = this.getTabSlugFromSubsidiaryUrl(route);
    if (tabSlugInUrl) {
      this.tabsService.selectedTab = tabSlugInUrl.slug;
      return true;
    }
    return false;
  }

  public getTabSlugFromMainDashboardUrl(route: NavigationEnd): string {
    const url = route.urlAfterRedirects;

    const hashIndex = url.indexOf('#');
    if (hashIndex !== -1 && hashIndex < url.length - 1) {
      const urlWithoutFragment = url.substring(0, hashIndex);
      if (!urlWithoutFragment.includes('dashboard')) return null;

      const tabSlug = url.substring(hashIndex + 1);
      return this.tabs.find((tab) => tab.slug === tabSlug) ? tabSlug : null;
    }

    return null;
  }

  private handleSubsidiaryTabChange(route: NavigationEnd): boolean {
    const tabInUrl = this.getTabSlugFromMainDashboardUrl(route);
    if (tabInUrl && this.tabs[this.currentTab].slug !== tabInUrl) {
      this.tabsService.selectedTab = tabInUrl;
      return true;
    }
    return false;
  }

  public getTabSlugFromSubsidiaryUrl(route: NavigationEnd) {
    const urlArray = route.urlAfterRedirects.split('/').filter((section) => section.length > 0);
    if (urlArray.length > 2) {
      return this.tabs.find((tab) => urlArray[2] === tab.slug);
    }
  }

  private handleNavigationOfNonDashboardPages(route: NavigationEnd): void {
    const url = route.urlAfterRedirects;
    const urlArray = url.split('/');

    for (const { urlPart, tabSlug } of UrlPartsRelatedToTabs) {
      if (urlArray.includes(urlPart)) {
        this.updateActiveTabBySlug(tabSlug);
        return;
      }
    }
  }

  private setTabOnInit(): void {
    const hash = this.isParentViewingSub ? this.getTabSlugInSubView() : this.route.snapshot.fragment;

    if (hash) {
      const activeTab = this.tabs.findIndex((tab) => tab.slug === hash);
      if (activeTab) {
        this.selectTab(null, activeTab, false, false, true);
      }
    }
    const activeTabs = this.tabs.filter((tab) => tab.active);

    if (activeTabs.length === 0) {
      this.selectTab(null, 0, false, false, true);
    }
  }

  private selectedTabSubscription(): void {
    this.subscriptions.add(
      this.tabsService.selectedTab$.subscribe((selectedTabSlug) => {
        this.unselectTabs();
        const tabIndex = this.tabs.findIndex((tab) => tab.slug === selectedTabSlug);
        if (tabIndex > -1) {
          this.updateActiveTab(tabIndex);

          if (!this.isParentViewingSub) {
            if (this.dashboardView) {
              this.location.replaceState(`/dashboard#${selectedTabSlug}`);
            } else if (this.clickEvent) {
              this.router.navigate(['/dashboard'], { fragment: selectedTabSlug });
            }
          }
          if (this.focus) {
            setTimeout(() => {
              this.tablist.nativeElement.querySelector('.asc-tab--active').focus();
            });
          }
        }
      }),
    );
  }

  public onKeyUp(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Right':
      case 'ArrowRight':
        if (this.currentTab === this.tabs.length - 1) {
          this.selectTab(event, 0);
        } else {
          this.selectTab(event, this.currentTab + 1);
        }
        break;
      case 'Left':
      case 'ArrowLeft':
        if (this.currentTab === 0) {
          this.selectTab(event, this.tabs.length - 1);
        } else {
          this.selectTab(event, this.currentTab - 1);
        }
        break;
    }
  }

  public onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Home':
        this.selectTab(event, 0);
        break;
      case 'End':
        this.selectTab(event, this.tabs.length - 1);
        break;
    }
  }

  public selectTab(event: Event, index: number, focus: boolean = true, clicked = true, isOnPageLoad = false): void {
    event?.preventDefault();

    this.clickEvent = clicked;
    this.focus = focus;
    const tab = this.tabs[index];

    this.selectedTabClick.emit({ tabSlug: tab.slug });
    this.tabsService.selectedTab = tab.slug;

    if (!isOnPageLoad && this.isParentViewingSub) {
      let subsidiaryUid: string = this.parentSubsidiaryViewService.getSubsidiaryUid();
      this.router.navigate([`/subsidiary/${subsidiaryUid}/${tab.slug}`]);
    }
  }

  private unselectTabs(): void {
    this.tabs.forEach((t) => (t.active = false));
  }

  private updateActiveTabBySlug(tabSlug: string): void {
    const selectedTabIndex = this.tabs.findIndex((tab) => tab.slug === tabSlug);
    if (selectedTabIndex < 0) {
      return;
    }
    this.updateActiveTab(selectedTabIndex);
  }

  private updateActiveTab(tabIndex: number): void {
    if (tabIndex < 0 || tabIndex >= this.tabs.length) {
      return;
    }
    this.currentTab = tabIndex;
    this.tabs.forEach((tab, index) => (tab.active = index === tabIndex));
  }

  public getTabSlugInSubView(): string {
    const urlSegmentGroup = this.route.snapshot['_urlSegment'];
    const urlSegments = urlSegmentGroup.children?.primary?.segments;
    if (urlSegments?.length == 3) {
      const tabSlug = urlSegments[2].path;
      return this.tabs.find((tab) => tab.slug === tabSlug) ? tabSlug : null;
    }
    return null;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.unselectTabs();
    this.tabsService.selectedTab = null;
  }
}
