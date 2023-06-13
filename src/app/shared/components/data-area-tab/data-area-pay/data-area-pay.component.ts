import { Component, Input, OnInit } from '@angular/core';
import { BenchmarksResponse, BenchmarkValue } from '@core/model/benchmarks.model';
import { benchmarksData } from '@core/test-utils/MockBenchmarkService';

@Component({
  selector: 'app-data-area-pay',
  templateUrl: './data-area-pay.component.html',
  styleUrls: ['../data-area-tab.component.scss'],
})
export class DataAreaPayComponent implements OnInit {
  @Input() data: BenchmarksResponse;
  public viewBenchmarksPosition = false;

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  public handleViewBenchmarkPosition(visible: boolean): void {
    console.log(this.data);
    this.viewBenchmarksPosition = visible;
  }
}
