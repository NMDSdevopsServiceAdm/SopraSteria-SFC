import { Component, Input } from '@angular/core';
import { BenchmarksResponse } from '@core/model/benchmarks.model';

@Component({
  selector: 'app-data-area-recruitment-and-retention',
  templateUrl: './data-area-recruitment-and-retention.component.html',
  styleUrls: ['../data-area-tab.component.scss'],
})
export class DataAreaRecruitmentAndRetentionComponent {
  @Input() data: BenchmarksResponse;
  @Input() viewBenchmarksComparisonGroups: boolean;
  public viewBenchmarksPosition = false;

  public handleViewBenchmarkPosition(visible: boolean): void {
    this.viewBenchmarksPosition = visible;
  }
}
