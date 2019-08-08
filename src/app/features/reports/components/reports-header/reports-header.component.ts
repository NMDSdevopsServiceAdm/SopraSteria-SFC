import { Component, Input } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';

@Component({
  selector: 'app-reports-header',
  templateUrl: './reports-header.component.html',
})
export class ReportsHeaderComponent {
  @Input() workplace: Establishment;
  @Input() title = 'Reports';
}
