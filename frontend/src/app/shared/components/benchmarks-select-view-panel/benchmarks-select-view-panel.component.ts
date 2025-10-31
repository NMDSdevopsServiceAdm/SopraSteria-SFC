import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-benchmarks-select-view-panel',
    templateUrl: './benchmarks-select-view-panel.component.html',
    styleUrls: ['./benchmarks-select-view-panel.component.scss'],
    standalone: false
})
export class BenchmarksSelectViewPanelComponent {
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
