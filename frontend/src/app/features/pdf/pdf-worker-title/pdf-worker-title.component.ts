import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { PdfComponent } from '@core/services/pdf.service';

@Component({
  selector: 'app-pdf-worker-title',
  templateUrl: './pdf-worker-title.component.html',
})
export class PdfWorkerTitleComponent implements PdfComponent {
  @ViewChild('content') public content: ElementRef;
  @Input() workplace: Establishment;
  @Input() worker: Worker;
  @Input() lastUpdatedDate: Date | string;

  constructor() {}
}
