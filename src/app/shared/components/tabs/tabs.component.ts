import { Location } from '@angular/common';
import { AfterContentInit, Component, ContentChildren, ElementRef, QueryList, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TabComponent } from './tab.component';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
})
export class TabsComponent implements AfterContentInit {
  private currentTab: number;
  @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;

  @ViewChild('tablist') tablist: ElementRef;

  constructor(private location: Location, private route: ActivatedRoute) {}

  ngAfterContentInit() {
    const hash = this.route.snapshot.fragment;
    if (hash) {
      const activeTab = this.tabs.toArray().findIndex(tab => tab.slug === hash);
      if (activeTab) {
        this.selectTab(null, activeTab, false);
      }
    }

    const activeTabs = this.tabs.filter(tab => tab.active);

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

    const tab = this.tabs.toArray()[index];
    this.currentTab = index;

    this.unselectTabs();
    tab.active = true;
    this.location.replaceState(`${this.location.path()}#${tab.slug}`);

    if (focus) {
      setTimeout(() => {
        this.tablist.nativeElement.querySelector('.govuk-tabs__tab--selected').focus();
      });
    }
  }

  private unselectTabs() {
    this.tabs.toArray().forEach(t => (t.active = false));
  }
}
