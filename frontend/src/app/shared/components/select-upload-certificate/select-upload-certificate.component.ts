import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-select-upload-certificate',
    templateUrl: './select-upload-certificate.component.html',
    styleUrls: ['./select-upload-certificate.component.scss'],
    standalone: false
})
export class SelectUploadCertificateComponent {
  @Input() filesToUpload: File[];
  @Input() certificateErrors: string[] | null;
  @Output() selectFiles = new EventEmitter<File[]>;

  public getUploadComponentAriaDescribedBy(): string {
    if (this.certificateErrors) {
      return 'uploadCertificate-errors uploadCertificate-aria-text';
    } else if (this.filesToUpload?.length > 0) {
      return 'uploadCertificate-aria-text';
    } else {
      return 'uploadCertificate-hint uploadCertificate-aria-text';
    }
  }

  public onSelectFiles(newFiles: File[]): void {
    this.selectFiles.emit(newFiles)
  }
}
