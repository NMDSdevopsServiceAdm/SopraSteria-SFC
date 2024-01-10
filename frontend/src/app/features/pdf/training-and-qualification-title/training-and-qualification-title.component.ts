import { Component, ElementRef, ViewChild } from '@angular/core';
import { PdfComponent } from '@core/services/pdf.service';

@Component({
  selector: 'app-pdf-training-and-qualification-title',
  templateUrl: './training-and-qualification-title.component.html',
})
export class PdfTraininAndQualificationTitle implements PdfComponent {
  @ViewChild('content') public content: ElementRef;
  public worker;
  public lastUpdatedDate;

  constructor() {}
}
