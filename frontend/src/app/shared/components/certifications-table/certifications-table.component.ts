import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TrainingCertificate } from '@core/model/training.model';

@Component({
  selector: 'app-certifications-table',
  templateUrl: './certifications-table.component.html',
  styleUrls: ['./certifications-table.component.scss'],
})
export class CertificationsTableComponent implements OnInit {
  @Input() certificates: TrainingCertificate[] = [];
  @Input() filesToUpload: File[] = [];
  @Output() removeFileToUpload = new EventEmitter<number>();
  @Output() downloadCertificate = new EventEmitter<number>();

  ngOnInit() {}

  public handleRemoveUploadFile(event: Event, index: number): void {
    event.preventDefault();
    this.removeFileToUpload.emit(index);
  }

  public handleDownloadCertificate(event: Event, index: number): void {
    event.preventDefault();
    this.downloadCertificate.emit(index);
  }
}
