import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-download-pdf',
  templateUrl: './download-pdf.component.html',
  styleUrls: ['./download-pdf.component.scss'],
})
export class DownloadPdfComponent {
  @Input() linkUrl: string;
  @Input() linkTitle: string;
  @Output() downloadPDF = new EventEmitter();

  public downloadAsPDF(event: Event): void {
    event.preventDefault();
    this.downloadPDF.emit();
  }
}
