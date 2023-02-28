import { Location } from '@angular/common';
import {
  AfterContentInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TabsService } from '@core/services/tabs.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-tabs',
  templateUrl: './new-tabs.component.html',
  styleUrls: ['./new-tabs.component.scss'],
})
export class NewTabsComponent implements AfterContentInit, OnDestroy {
  @Output() selectedTabClick = new EventEmitter();
  @Output() viewTab: EventEmitter<string> = new EventEmitter();
  @Input() tabs: { title: string; slug: string; active: boolean }[];
  private currentTab: number;
  private subscriptions: Subscription = new Subscription();

  @ViewChild('tablist') tablist: ElementRef;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private tabsService: TabsService,
  ) {
    //handle tab changes home page link
    // ????????????
    this.subscriptions.add(
      this.workerService.tabChanged.subscribe((displayStaffTab: boolean) => {
        let activeTabs: any[] = [];
        if (this.tabs) {
          activeTabs = this.tabs.filter((tab) => tab.active);
        }
        if (displayStaffTab && activeTabs.length !== 0) {
          this.location.path().includes('dashboard') ? this.selectTab(null, 2) : this.selectTab(null, 1); //2 for staff tab;
        }
      }),
    );
  }

  ngAfterContentInit(): void {
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

  public onKeyUp(event: KeyboardEvent) {
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

  public onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Home':
        this.selectTab(event, 0);
        break;
      case 'End':
        this.selectTab(event, this.tabs.length - 1);
        break;
    }
  }

  public selectTab(event: Event, index: number, focus: boolean = true) {
    if (event) {
      event.preventDefault();
    }

    const hasCurrentTab = Boolean(this.currentTab);
    const tab = this.tabs[index];
    this.currentTab = index;

    this.unselectTabs();
    tab.active = true;

    this.tabsService.selectedTab = tab.slug;

    const path = hasCurrentTab ? this.location.path().split('?')[0] : this.location.path();
    this.location.replaceState(`${path}#${tab.slug}`);

    if (focus) {
      setTimeout(() => {
        this.tablist.nativeElement.querySelector('.asc-active').focus();
      });
    }
  }

  private unselectTabs() {
    this.tabs.forEach((t) => (t.active = false));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
