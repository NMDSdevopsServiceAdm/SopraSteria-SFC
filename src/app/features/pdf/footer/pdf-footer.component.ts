import { Component, ElementRef, ViewChild } from '@angular/core';
import { PdfComponent } from '@core/services/pdf.service';

@Component({
  selector: 'app-pdf-footer',
  templateUrl: './pdf-footer.component.html',
})
export class PdfFooterComponent implements PdfComponent {
  @ViewChild('content', { static: true }) public content: ElementRef;
}
