import { Location } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TabsService } from '@core/services/tabs.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-tabs',
  templateUrl: './new-tabs.component.html',
  styleUrls: ['./new-tabs.component.scss'],
})
export class NewTabsComponent implements OnInit, OnDestroy {
  @Output() selectedTabClick = new EventEmitter();
  @Input() tabs: { title: string; slug: string; active: boolean }[];
  @Input() dashboardView: boolean;
  private currentTab: number;
  private subscriptions: Subscription = new Subscription();
  private focus: boolean;

  @ViewChild('tablist') tablist: ElementRef;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private tabsService: TabsService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.selectedTabSubscription();

    const hash = this.route.snapshot.fragment;

    if (hash) {
      const activeTab = this.tabs.findIndex((tab) => tab.slug === hash);
      if (activeTab) {
        this.selectTab(null, activeTab, false);
      }
    }
    const activeTabs = this.tabs.filter((tab) => tab.active);

    if (activeTabs.length === 0) {
      this.selectTab(null, 0, false);
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

          if (this.dashboardView) {
            this.location.replaceState(`/dashboard#${tab.slug}`);
          } else {
            this.router.navigate(['/dashboard'], { fragment: tab.slug });
          }
          if (focus) {
            setTimeout(() => {
              this.tablist.nativeElement.querySelector('.asc-active').focus();
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

  public selectTab(event: Event, index: number, focus: boolean = true): void {
    event?.preventDefault();

    this.focus = focus;
    const tab = this.tabs[index];
    this.selectedTabClick.emit({ tabSlug: tab.slug });
    this.tabsService.selectedTab = tab.slug;
  }

  private unselectTabs() {
    this.tabs.forEach((t) => (t.active = false));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.unselectTabs();
    this.tabsService.selectedTab = null;
  }
}
