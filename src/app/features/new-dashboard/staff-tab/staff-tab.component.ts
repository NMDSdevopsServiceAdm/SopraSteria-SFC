import { Component, Input } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';

@Component({
  selector: 'app-new-staff-tab',
  templateUrl: './staff-tab.component.html',
})
export class NewStaffTabComponent {
  @Input() workplace: Establishment;
}
