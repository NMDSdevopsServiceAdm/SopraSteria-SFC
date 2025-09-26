import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-select-view-panel',
    templateUrl: './select-view-panel.component.html',
    styleUrls: ['./select-view-panel.component.scss'],
    standalone: false
})
export class SelectViewPanelComponent {
  @Input() tabs: { name: string; fragment: string }[];
  @Input() activeTabIndex: number = 0;
  @Output() handleTabChange: EventEmitter<number> = new EventEmitter();

  public handleViewChange(event: Event, index: number): void {
    event.preventDefault();
    this.activeTabIndex = index;
    this.handleTabChange.emit(index);
  }
}
