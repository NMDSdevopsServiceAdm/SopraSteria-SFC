import { Component, input, output } from '@angular/core';
import { Certificate } from '@core/model/trainingAndQualifications.model';

@Component({
  selector: 'app-display-certificate',
  templateUrl: './display-certificate-in-table.component.html',
  standalone: false,
})
export class DisplayCertificateInTableComponent {
  public canEditWorker = input.required<boolean>();
  public certificates = input.required<Certificate[]>();
  public linkToRecordPage = input.required<string[]>();

  public onDownload = output();
  public onUpload = output<File[]>();

  handleDownload(event: Event) {
    event.preventDefault();
    this.onDownload.emit();
  }

  handleUpload(files: File[]) {
    this.onUpload.emit(files);
  }
}
