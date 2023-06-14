import { Component, Input } from '@angular/core';

@Component({
  selector: 'tr[app-data-area-table-row]',
  templateUrl: './data-area-table-row.component.html',
  styleUrls: ['../data-area-tab.component.scss'],
})
export class DataAreaTableRowComponent {
  @Input() header: string;
  @Input() workplaceCell: string;
  @Input() comparisonCell: string;
}
