import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-select-view-panel',
  templateUrl: './select-view-panel.component.html',
  styleUrls: ['./select-view-panel.component.scss'],
})
export class SelectViewPanelComponent {
  @Input() falseSelectionName: string;
  @Input() trueSelectionName: string;
  @Output() handleViewToggle: EventEmitter<boolean> = new EventEmitter();

  public toggleBoolean: boolean;

  public handleViewChange(event: Event, toggle: boolean): void {
    event.preventDefault();
    this.toggleBoolean = toggle;
    this.handleViewToggle.emit(toggle);
  }
}
