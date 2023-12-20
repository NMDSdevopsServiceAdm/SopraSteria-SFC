import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { QualificationsByGroup } from '@core/model/qualification.model';

@Component({
  selector: 'app-new-qualifications',
  templateUrl: './new-qualifications.component.html',
})
export class NewQualificationsComponent {
  @Input() qualificationsByGroup: QualificationsByGroup;
  @Input() canEditWorker: boolean;
  @ViewChild('content') public content: ElementRef;
}
