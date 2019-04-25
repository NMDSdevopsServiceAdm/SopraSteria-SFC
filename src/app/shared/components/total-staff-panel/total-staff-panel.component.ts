import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-total-staff-panel',
  templateUrl: './total-staff-panel.component.html',
  styleUrls: ['./total-staff-panel.component.scss'],
})
export class TotalStaffPanelComponent {
  @Input() totalStaff = 0;
  @Input() totalWorkers = 0;

  constructor() {}
}
