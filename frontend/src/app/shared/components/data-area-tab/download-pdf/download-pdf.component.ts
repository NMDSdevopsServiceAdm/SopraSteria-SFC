import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-download-pdf',
    templateUrl: './download-pdf.component.html',
    standalone: false
})
export class DownloadPdfComponent {
  @Input() linkUrl: string;
  @Input() viewBenchmarksByCategory: boolean;
  @Output() downloadPDF = new EventEmitter();

  public downloadAsPDF(event: Event): void {
    event.preventDefault();
    this.downloadPDF.emit();
  }
}
