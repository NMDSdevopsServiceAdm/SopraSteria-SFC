import { AfterContentInit, Component, ContentChildren, QueryList } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TabComponent } from './tab.component';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent implements AfterContentInit {
  @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;

  constructor(private activatedRoute: ActivatedRoute) {}

  // contentChildren are set
  ngAfterContentInit() {
    // get all active tabs
    const activeTabs = this.tabs.filter(tab => tab.active);

    console.log(this.tabs, activeTabs, 1);

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
    tab.active = true;
  }
}
