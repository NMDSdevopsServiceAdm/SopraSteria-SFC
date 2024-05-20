import { Location } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TabsService } from '@core/services/tabs.service';
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
  @Input() tabs: { title: string; slug: string; active: boolean }[];
  @Input() dashboardView: boolean;

  private currentTab: number;
  private subscriptions: Subscription = new Subscription();
  private focus: boolean;
  private clickEvent: boolean;

  @ViewChild('tablist') tablist: ElementRef;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    public tabsService: TabsService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.selectedTabSubscription();
    this.setTabOnInit();
    this.trackRouterEventsToSetTabInSubView();
  }

  private trackRouterEventsToSetTabInSubView(): void {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((route: NavigationEnd) => {
      if (this.parentSubsidiaryViewService.getViewingSubAsParent()) {
        const tabInUrl = this.getTabSlugFromNavigationEvent(route);

        if (tabInUrl) {
          this.tabsService.selectedTab = tabInUrl.slug;
        }
      }
    });
  }

  public getTabSlugFromNavigationEvent(route: NavigationEnd) {
    const urlArray = route.urlAfterRedirects.split('/').filter((section) => section.length > 0);
    if (urlArray.length > 2) {
      return this.tabs.find((tab) => urlArray[2] === tab.slug);
    }
  }

  private setTabOnInit(): void {
    const hash = this.parentSubsidiaryViewService.getViewingSubAsParent()
      ? this.getTabSlugInSubView()
      : this.route.snapshot.fragment;

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
      this.tabsService.selectedTab$.subscribe((selectedTab) => {
        this.unselectTabs();
        const tabIndex = this.tabs.findIndex((tab) => tab.slug === selectedTab);
        if (tabIndex > -1) {
          const tab = this.tabs[tabIndex];
          tab.active = true;
          this.currentTab = tabIndex;

          if (!this.parentSubsidiaryViewService.getViewingSubAsParent()) {
            if (this.dashboardView) {
              this.location.replaceState(`/dashboard#${tab.slug}`);
            } else if (this.clickEvent) {
              this.router.navigate(['/dashboard'], { fragment: tab.slug });
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

    if (!isOnPageLoad && this.parentSubsidiaryViewService.getViewingSubAsParent()) {
      let subsidiaryUid: string = this.parentSubsidiaryViewService.getSubsidiaryUid();
      this.router.navigate([`/subsidiary/${subsidiaryUid}/${tab.slug}`]);
    }
  }

  private unselectTabs() {
    this.tabs.forEach((t) => (t.active = false));
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
