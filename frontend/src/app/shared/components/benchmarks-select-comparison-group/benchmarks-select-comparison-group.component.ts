import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-benchmarks-select-comparison-group',
    templateUrl: './benchmarks-select-comparison-group.component.html',
    styleUrls: ['./benchmarks-select-comparison-group.component.scss'],
    standalone: false
})
export class BenchmarksSelectComparisonGroupsComponent {
  @Input() comparisonDataExists: boolean;
  @Input() viewBenchmarksComparisonGroups: boolean;
  @Input() mainServiceName: string;
  @Input() localAuthorityLocation: string;
  @Output() handleViewToggle: EventEmitter<boolean> = new EventEmitter();

  public handleViewChange(event: Event): void {
    event.preventDefault();
    this.handleViewToggle.emit(!this.viewBenchmarksComparisonGroups);
  }
}
