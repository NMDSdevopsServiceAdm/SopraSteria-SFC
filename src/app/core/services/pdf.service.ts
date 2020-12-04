import { ComponentFactoryResolver, ComponentRef, ElementRef, Injectable, Injector, Type } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { PdfFooterComponent } from '@features/pdf/footer/pdf-footer.component';
import { PdfHeaderComponent } from '@features/pdf/header/pdf-header.component';
import { PdfPageComponent } from '@features/pdf/pdf-page.component';
import { PdfWorkplaceTitleComponent } from '@features/pdf/workplace-title/pdf-workplace-title.component';
import { jsPDF } from 'jspdf';

export interface PdfComponent {
  content: ElementRef;
}

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor(private componentFactoryResolver: ComponentFactoryResolver, private injector: Injector) {}

  public async BuildBenchmarksPdf(elRef: ElementRef, aboutData: ElementRef, workplace: Establishment) {
    const doc = new jsPDF('p', 'pt', 'a4');
    const scale = 0.5;
    const width = 1000;
    const spacing = 50;
    const y = 20;
    const html = document.createElement('div');

    html.style.width = `${width}px`;
    html.style.display = 'block';

    const pdf = this.resolvePdfPage(workplace);

    this.addPage(elRef, pdf, html);

    pdf.placeholder.nativeElement.removeChild(pdf.workplaceTitle.nativeElement);

    html.append(this.createSpacer(width, spacing));
    this.addPage(elRef, pdf, html);

    html.append(this.createSpacer(width, spacing));
    const aboutDataHtml = aboutData.nativeElement.cloneNode(true);
    const allUl = aboutDataHtml.getElementsByTagName('ul');
    for (let ul of allUl) {
      ul.style.listStyle = 'none';
      ul.style.paddingLeft = '0';
    }
    const allLi = aboutDataHtml.getElementsByTagName('li');
    for (let li of allLi) {
      li.textContent = '- ' + li.textContent;
    }
    pdf.placeholder.nativeElement.appendChild(aboutDataHtml);
    html.append(pdf.body.nativeElement.cloneNode(true));
    pdf.placeholder.nativeElement.removeChild(aboutDataHtml);

    await this.saveHtmlToPdf('benchmarks.pdf', doc, html, y, scale, width);

    return doc;
  }

  private addPage(element: ElementRef<any>, pdf: PdfPageComponent, html: HTMLDivElement) {
    const el = element.nativeElement.cloneNode(true);
    pdf.placeholder.nativeElement.appendChild(el);
    html.append(pdf.body.nativeElement.cloneNode(true));
    pdf.placeholder.nativeElement.removeChild(el);
  }

  private async saveHtmlToPdf(filename, doc, html, y, scale, width) {
    const widthHtml = width * scale;
    const x = (doc.internal.pageSize.getWidth() - widthHtml) / 2;

    const html2canvas = {
      scale,
      width,
      windowWidth: width,
    };

    await doc.html(html, {
      x,
      y,
      html2canvas,
    });

    doc.save(filename);
  }

  private createSpacer(width: number, space: number) {
    const spacer = document.createElement('div');
    spacer.style.width = `${width}px`;
    spacer.style.height = `${space}px`;
    return spacer;
  }

  private resolveComponent<T extends PdfComponent>(
    componentType: Type<T>,
    callback: (c: ComponentRef<T>) => void = (c) => {},
  ) {
    var componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);
    var component = componentFactory.create(this.injector);
    callback(component);
    return component.instance.content.nativeElement;
  }

  private resolvePdfPage(workplace: Establishment): PdfPageComponent {
    var componentFactory = this.componentFactoryResolver.resolveComponentFactory(PdfPageComponent);
    var component = componentFactory.create(this.injector);
    component.instance.workplace = workplace;
    component.changeDetectorRef.detectChanges();
    return component.instance;
  }
}
