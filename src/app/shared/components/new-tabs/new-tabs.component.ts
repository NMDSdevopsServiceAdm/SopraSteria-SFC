import { Location } from '@angular/common';
import {
  AfterContentInit,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  OnDestroy,
  Output,
  QueryList,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

import { NewTabComponent } from './new-tab.component';

@Component({
  selector: 'app-new-tabs',
  templateUrl: './new-tabs.component.html',
  styleUrls: ['./new-tabs.component.scss'],
})
export class NewTabsComponent implements AfterContentInit, OnDestroy {
  @Output() selectedTabClick = new EventEmitter();

  private currentTab: number;
  private subscriptions: Subscription = new Subscription();
  @ContentChildren(NewTabComponent) tabs: QueryList<NewTabComponent>;

  @ViewChild('tablist') tablist: ElementRef;

  constructor(private location: Location, private route: ActivatedRoute, private workerService: WorkerService) {
    //handle tab changes home page link
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

  ngAfterContentInit() {
    const hash = this.route.snapshot.fragment;
    if (hash) {
      const activeTab = this.tabs.toArray().findIndex((tab) => tab.slug === hash);
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
    const tab = this.tabs.toArray()[index];
    this.currentTab = index;

    this.unselectTabs();
    tab.active = true;

    this.selectedTabClick.emit({ tabSlug: tab.slug });

    const path = hasCurrentTab ? this.location.path().split('?')[0] : this.location.path();
    this.location.replaceState(`${path}#${tab.slug}`);

    if (focus) {
      setTimeout(() => {
        this.tablist.nativeElement.querySelector('.govuk-tabs__tab--selected').focus();
      });
    }
  }

  private unselectTabs() {
    this.tabs.toArray().forEach((t) => (t.active = false));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
