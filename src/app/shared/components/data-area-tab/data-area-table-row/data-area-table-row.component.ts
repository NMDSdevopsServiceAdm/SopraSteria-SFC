import { Component, Input, OnInit } from '@angular/core';
import { BenchmarksResponse, BenchmarkValue, Tile } from '@core/model/benchmarks.model';
import { benchmarksData } from '@core/test-utils/MockBenchmarkService';

@Component({
  selector: 'tr[app-data-area-table-row]',
  templateUrl: './data-area-table-row.component.html',
  styleUrls: ['../data-area-tab.component.scss'],
})
export class DataAreaTableRowComponent implements OnInit {
  @Input() header: string;
  @Input() data: Tile;

  public workplaceCell;
  public comparisonCell;

  ngOnInit(): void {
    console.log(this.data);
    if(this.data.workplaceValue?.hasValue) {
        this.workplaceCell = this.data.workplaceValue.value;
      }
      this.workplaceCell = 'No data added';
  }
}
