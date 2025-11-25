import { Component, ElementRef, ViewChild } from '@angular/core';
import { Pages, PdfComponent } from '@core/services/pdf.service';

@Component({
    selector: 'app-pdf-footer',
    templateUrl: './pdf-footer.component.html',
    standalone: false
})
export class PdfFooterComponent implements PdfComponent {
  public pages: Pages;
  @ViewChild('content', { static: true }) public content: ElementRef;
}
