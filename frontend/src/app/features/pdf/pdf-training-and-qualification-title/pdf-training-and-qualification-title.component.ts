import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { PdfComponent } from '@core/services/pdf.service';

@Component({
    selector: 'app-training-and-qualification-title',
    templateUrl: './pdf-training-and-qualification-title.component.html',
    standalone: false
})
export class PdfTrainingAndQualificationTitleComponent implements PdfComponent {
  @ViewChild('content') public content: ElementRef;
  @Input() workplace: Establishment;
  @Input() worker: Worker;
  @Input() lastUpdatedDate: Date | string;

  constructor() {}
}
