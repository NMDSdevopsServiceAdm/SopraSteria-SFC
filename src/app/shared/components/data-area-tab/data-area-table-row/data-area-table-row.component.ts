import { Component, Input, OnInit } from '@angular/core';
import { Tile } from '@core/model/benchmarks.model';

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
    if (this.data.workplaceValue?.hasValue) {
      this.workplaceCell = this.data.workplaceValue.value;
    }
    this.workplaceCell = 'No data added';
  }
}
