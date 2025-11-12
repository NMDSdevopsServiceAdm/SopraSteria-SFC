import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Certificate } from '@core/model/trainingAndQualifications.model';

@Component({
    selector: 'app-certifications-table',
    templateUrl: './certifications-table.component.html',
    styleUrls: ['./certifications-table.component.scss'],
    standalone: false
})
export class CertificationsTableComponent implements OnInit {
  @Input() certificates: Certificate[] = [];
  @Input() filesToUpload: File[] = [];
  @Output() removeFileToUpload = new EventEmitter<number>();
  @Output() removeSavedFile = new EventEmitter<number>();
  @Output() downloadCertificate = new EventEmitter<number>();

  public dateToday: Date;

  ngOnInit() {
    this.dateToday = new Date();
  }

  public handleRemoveUploadFile(event: Event, index: number): void {
    event.preventDefault();
    this.removeFileToUpload.emit(index);
  }

  public handleRemoveSavedFile(event: Event, index: number): void {
    event.preventDefault();
    this.removeSavedFile.emit(index);
  }

  public handleDownloadCertificate(event: Event, index: number): void {
    event.preventDefault();
    this.downloadCertificate.emit(index);
  }
}
