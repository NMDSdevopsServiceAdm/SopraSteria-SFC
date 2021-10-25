import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-new-qualifications',
  templateUrl: './new-qualifications.component.html',
})
export class NewQualificationsComponent {
  @Input() qualificationsByType: any;
}
