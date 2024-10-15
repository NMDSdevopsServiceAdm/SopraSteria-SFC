import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import {
  QualificationsByGroup,
  QualificationCertificateDownloadEvent,
  QualificationCertificateUploadEvent,
  BasicQualificationRecord,
  QualificationType,
} from '@core/model/qualification.model';

@Component({
  selector: 'app-new-qualifications',
  templateUrl: './new-qualifications.component.html',
})
export class NewQualificationsComponent {
  @Input() qualificationsByGroup: QualificationsByGroup;
  @Input() canEditWorker: boolean;
  @Input() public certificateErrors: Record<string, string> = {};
  @Output() public downloadFile = new EventEmitter<QualificationCertificateDownloadEvent>();
  @Output() public uploadFile = new EventEmitter<QualificationCertificateUploadEvent>();
  @ViewChild('content') public content: ElementRef;

  public handleDownloadCertificate(event: Event, qualificationRecord: BasicQualificationRecord) {
    event.preventDefault();
    this.downloadFile.emit({
      recordType: 'qualification',
      recordUid: qualificationRecord.uid,
      qualificationType: 'Awards' as QualificationType,
      filesToDownload: qualificationRecord.qualificationCertificates,
    });
  }
}
