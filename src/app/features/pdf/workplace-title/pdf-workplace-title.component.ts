import { Component, ElementRef, ViewChild } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { PdfComponent } from '@core/services/pdf.service';

@Component({
  selector: 'app-pdf-workplace-title',
  templateUrl: './pdf-workplace-title.component.html',
})
export class PdfWorkplaceTitleComponent implements PdfComponent {
  @ViewChild('content') public content: ElementRef;
  public workplace: Establishment;

  constructor() {}
}
