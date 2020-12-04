import { Component, ElementRef, ViewChild } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';

@Component({
  selector: 'app-pdf',
  templateUrl: './pdf-page.component.html',
  styleUrls: ['./pdf-page.component.scss'],
})
export class PdfPageComponent {
  @ViewChild('body', { static: true }) public body: ElementRef;
  @ViewChild('header', { static: true }) public header: ElementRef;
  //@ViewChild('content', { static: true }) public content: ElementRef;
  @ViewChild('workplaceTitle', { static: true }) public workplaceTitle: ElementRef;
  @ViewChild('placeholder', { static: true }) public placeholder: ElementRef;
  @ViewChild('footer', { static: true }) public footer: ElementRef;
  public workplace: Establishment;
}
