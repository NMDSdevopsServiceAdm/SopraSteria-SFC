import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-download-pdf-training-and-qualification',
    templateUrl: './download-pdf-training-and-qualification.component.html',
    standalone: false
})
export class DownloadPdfTrainingAndQualificationComponent {
  @Input() linkUrl: string;
  @Output() downloadPDF = new EventEmitter();

  public downloadAsPDF(event: Event): void {
    event.preventDefault();
    this.downloadPDF.emit();
  }
}
