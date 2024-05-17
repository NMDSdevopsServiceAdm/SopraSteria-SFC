import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubsidiaryTabsService } from '@core/services/tabs-interface.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-subsidiary-tabs',
  templateUrl: './subsidiary-tabs.component.html',
  styleUrls: ['./subsidiary-tabs.component.scss'],
})
export class SubsidiaryTabsComponent implements OnInit {
  @Input() tabs: { title: string; slug: string; active: boolean }[];

  private currentTab: number;
  private subscriptions: Subscription = new Subscription();

  @ViewChild('tablist') tablist: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private tabsService: SubsidiaryTabsService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.selectedTabSubscription();
    this.setTabOnInit();
  }

  private selectedTabSubscription(): void {
    this.subscriptions.add(
      this.tabsService.selectedTab$.subscribe((selectedTab) => {
        this.unselectTabs();
        const tabIndex = this.tabs.findIndex((tab) => tab.slug === selectedTab);
        if (tabIndex > -1) {
          const tab = this.tabs[tabIndex];
          tab.active = true;
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

  public selectTab(event: Event, index: number): void {
    event?.preventDefault();

    const tab = this.tabs[index];
    this.currentTab = index;

    let subsidiaryUid: string = this.parentSubsidiaryViewService.getSubsidiaryUid();
    this.router.navigate([`/subsidiary/${tab.slug}/${subsidiaryUid}`]);
    this.tabsService.selectedTab = tab.slug;

    setTimeout(() => {
      this.tablist.nativeElement.querySelector('.asc-tab--active').focus();
    });
  }

  private unselectTabs() {
    this.tabs.forEach((t) => (t.active = false));
  }

  public getTabSlugFromUrl(): string {
    const urlSegmentGroup = this.route.snapshot['_urlSegment'];
    const urlSegments = urlSegmentGroup.children?.primary?.segments;
    if (urlSegments?.length == 3) {
      const tabSlug = urlSegments[1].path;
      return this.tabs.find((tab) => tab.slug === tabSlug) ? tabSlug : null;
    }
    return null;
  }

  public setTabOnInit(): void {
    const hash = this.getTabSlugFromUrl();

    if (hash) {
      const activeTab = this.tabs.findIndex((tab) => tab.slug === hash);
      if (activeTab) {
        this.selectTab(null, activeTab);
      }
    }
    const activeTabs = this.tabs.filter((tab) => tab.active);

    if (activeTabs.length === 0) {
      this.selectTab(null, 0);
    }
  }

  ngOnDestroy(): void {
    this.tabsService.selectedTab = null;
    this.subscriptions.unsubscribe();
    this.unselectTabs();
  }
}
