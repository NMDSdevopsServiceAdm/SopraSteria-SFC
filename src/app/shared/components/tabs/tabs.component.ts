import { AfterContentInit, Component, ContentChildren, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TabComponent } from './tab.component';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent implements AfterContentInit {
  @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;

  constructor(private route: ActivatedRoute, private router: Router) {}

  // contentChildren are set
  ngAfterContentInit() {
    const hash = this.route.snapshot.fragment;
    if (hash) {
      const activeTab = this.tabs.find(tab => tab.slug === hash);
      if (activeTab) {
        activeTab.active = true;
      }
    }

    // get all active tabs
    const activeTabs = this.tabs.filter(tab => tab.active);

    // if there is no active tab set, activate the first
    if (activeTabs.length === 0) {
      this.selectTab(null, this.tabs.first);
    }
  }

  selectTab(event: Event, tab: TabComponent) {
    if (event) {
      event.preventDefault();
    }
    // deactivate all tabs
    this.tabs.toArray().forEach(t => (t.active = false));

    // activate the tab the user has clicked on.
    this.router.navigate(this.route.snapshot.url, { fragment: tab.slug, replaceUrl: true });
    tab.active = true;
  }
}
