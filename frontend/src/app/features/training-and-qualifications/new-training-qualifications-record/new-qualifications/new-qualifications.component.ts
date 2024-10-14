import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { QualificationsByGroup } from '@core/model/qualification.model';
import { BasicQualificationRecord } from '../../../../core/model/qualification.model';
import { CertificateUpload } from '@core/model/training.model';

@Component({
  selector: 'app-new-qualifications',
  templateUrl: './new-qualifications.component.html',
})
export class NewQualificationsComponent {
  @Input() qualificationsByGroup: QualificationsByGroup;
  @Input() canEditWorker: boolean;
  @Input() public certificateErrors: Record<string, string> = {};
  @Output() public downloadFile = new EventEmitter<BasicQualificationRecord>();
  @Output() public uploadFile = new EventEmitter<CertificateUpload>();
  @ViewChild('content') public content: ElementRef;
}
