import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-benchmarks-select-view-panel',
  templateUrl: './benchmarks-select-view-panel.component.html',
  styleUrls: ['./benchmarks-select-view-panel.component.scss'],
})
export class BenchmarksSelectViewPanelComponent {
  @Input() viewBenchmarksByCategory: boolean;
  @Output() handleViewToggle: EventEmitter<boolean> = new EventEmitter();

  public handleViewChange(event: Event): void {
    event.preventDefault();
    this.handleViewToggle.emit(!this.viewBenchmarksByCategory);
  }
}
