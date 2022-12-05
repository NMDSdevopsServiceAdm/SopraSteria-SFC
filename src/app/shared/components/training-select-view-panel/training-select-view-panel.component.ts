import { AfterContentInit, Component, ContentChildren, ElementRef, QueryList, ViewChild } from '@angular/core';

import { TrainingSelectViewComponent } from './training-select-view.component';

@Component({
  selector: 'app-training-select-view-panel',
  templateUrl: './training-select-view-panel.component.html',
  styleUrls: ['./training-select-view-panel.component.scss'],
})
export class TrainingSelectViewPanelComponent implements AfterContentInit {
  @ContentChildren(TrainingSelectViewComponent) tabs: QueryList<TrainingSelectViewComponent>;

  @ViewChild('tablist') tablist: ElementRef;

  ngAfterContentInit(): void {
    this.selectTab(null, 0);
  }

  public selectTab(event: Event, index: number): void {
    event?.preventDefault();

    const tab = this.tabs.toArray()[index];

    this.unselectTabs();
    tab.active = true;
  }

  private unselectTabs() {
    this.tabs.toArray().forEach((t) => (t.active = false));
  }
}
