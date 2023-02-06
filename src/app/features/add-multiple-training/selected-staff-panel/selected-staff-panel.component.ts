import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-selected-staff-panel',
  templateUrl: './selected-staff-panel.component.html',
  styleUrls: ['./selected-staff-panel.component.scss'],
})
export class SelectedStaffPanelComponent {
  @Input() selectedWorkerCount: number;
}
