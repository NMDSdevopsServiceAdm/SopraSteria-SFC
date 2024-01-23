import { Component, ElementRef, ViewChild } from '@angular/core';
import { PdfComponent } from '@core/services/pdf.service';

@Component({
  selector: 'app-pdf-header',
  templateUrl: './pdf-header.component.html',
})
export class PdfHeaderComponent implements PdfComponent {
  @ViewChild('content', { static: true }) public content: ElementRef;
}
