import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import {
  QualificationsByGroup,
  QualificationCertificateDownloadEvent,
  QualificationCertificateUploadEvent,
  BasicQualificationRecord,
  QualificationType,
  QualificationGroup,
} from '@core/model/qualification.model';

@Component({
    selector: 'app-new-qualifications',
    templateUrl: './new-qualifications.component.html',
    standalone: false
})
export class NewQualificationsComponent {
  @Input() qualificationsByGroup: QualificationsByGroup;
  @Input() canEditWorker: boolean;
  @Input() public certificateErrors: Record<string, string> = {};
  @Input() public pdfRenderingMode: boolean = false;
  @Output() public downloadFile = new EventEmitter<QualificationCertificateDownloadEvent>();
  @Output() public uploadFile = new EventEmitter<QualificationCertificateUploadEvent>();
  @ViewChild('content') public content: ElementRef;

  public handleDownloadCertificate(
    event: Event,
    qualificationGroup: QualificationGroup,
    qualificationRecord: BasicQualificationRecord,
  ) {
    event.preventDefault();

    const filesToDownload = [
      {
        uid: qualificationRecord.qualificationCertificates[0].uid,
        filename: qualificationRecord.qualificationCertificates[0].filename,
      },
    ];

    this.downloadFile.emit({
      recordType: 'qualification',
      recordUid: qualificationRecord.uid,
      qualificationType: qualificationGroup.group as QualificationType,
      filesToDownload,
    });
  }

  public handleUploadCertificate(
    files: File[],
    qualificationGroup: QualificationGroup,
    qualificationRecord: BasicQualificationRecord,
  ) {
    this.uploadFile.emit({
      recordType: 'qualification',
      recordUid: qualificationRecord.uid,
      qualificationType: qualificationGroup.group as QualificationType,
      files,
    });
  }
}
