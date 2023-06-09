import { Component, Input } from '@angular/core';
import { BenchmarksResponse } from '@core/model/benchmarks.model';

@Component({
  selector: 'app-data-area-pay',
  templateUrl: './data-area-pay.component.html',
  styleUrls: ['../data-area-tab.component.scss'],
})
export class DataAreaPayComponent {
  @Input() tilesData: BenchmarksResponse;
  public viewBenchmarksPosition = false;

  public handleViewBenchmarkPosition(visible: boolean): void {
    this.viewBenchmarksPosition = visible;
  }
}
