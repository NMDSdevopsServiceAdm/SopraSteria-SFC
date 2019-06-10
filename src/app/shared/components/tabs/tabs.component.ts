import { AfterContentInit, Component, ContentChildren, QueryList, Input } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { TabComponent } from './tab.component';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements AfterContentInit {
  @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;
  @Input() displayWDFReport: boolean;

  constructor(private location: Location, private route: ActivatedRoute) {}

  ngAfterContentInit() {
    const hash = this.route.snapshot.fragment;
    if (hash) {
      const activeTab = this.tabs.find(tab => tab.slug === hash);
      if (activeTab) {
        this.unselectTabs();
        activeTab.active = true;
      }
    }

    const activeTabs = this.tabs.filter(tab => tab.active);

    if (activeTabs.length === 0) {
      this.selectTab(null, this.tabs.first);
    }
  }

  selectTab(event: Event, tab: TabComponent) {
    if (event) {
      event.preventDefault();
    }

    this.unselectTabs();
    this.location.replaceState(`${this.location.path()}#${tab.slug}`);
    tab.active = true;
  }

  unselectTabs() {
    this.tabs.toArray().forEach(t => (t.active = false));
  }
}
