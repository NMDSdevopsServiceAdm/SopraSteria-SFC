import { ComponentFactoryResolver, ComponentRef, ElementRef, Injectable, Injector, Type } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { PdfFooterComponent } from '@features/pdf/footer/pdf-footer.component';
import { PdfHeaderComponent } from '@features/pdf/header/pdf-header.component';
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
    const ptToPx = 1.3333333333;
    const a4heightpx = doc.internal.pageSize.getHeight() * ptToPx;
    const scale = 0.5;
    const width = 1000;
    const spacing = 50;
    const y = 20;
    const ypx = (y * ptToPx) / scale;
    const html = document.createElement('div');

    html.style.width = `${width}px`;
    html.style.display = 'block';

    const header = this.resolveComponent(PdfHeaderComponent);
    const footer = this.resolveComponent(PdfFooterComponent);
    const workplaceTitle = this.resolveComponent(PdfWorkplaceTitleComponent, (c) => {
      c.instance.workplace = workplace;
      c.changeDetectorRef.detectChanges();
    });

    html.append(header.cloneNode(true));
    html.append(this.createSpacer(width, spacing));

    html.append(workplaceTitle.cloneNode(true));
    html.append(this.createSpacer(width, spacing));
    html.append(elRef.nativeElement.cloneNode(true));

    const footerPosition = a4heightpx - this.getHeight(html) * scale - (380 * scale + ypx);
    html.append(this.createSpacer(width, footerPosition));
    html.append(footer.cloneNode(true));
    html.append(this.createSpacer(width, ypx * 2));

    html.append(header.cloneNode(true));

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
    html.append(aboutDataHtml);
    const footerPg2Position = a4heightpx * 2 - this.getHeight(html) * scale - (480 * scale - ypx * 2);
    html.append(this.createSpacer(width, footerPg2Position));
    html.append(footer.cloneNode(true));

    await this.saveHtmlToPdf('benchmarks.pdf', doc, html, y, scale, width);

    return doc;
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

    if (doc.getNumberOfPages() > 2) {
      for (let i = doc.getNumberOfPages(); i > 2; i--) {
        doc.deletePage(i);
      }
    }

    doc.save(filename);
  }

  private createSpacer(width: number, space: number) {
    const spacer = document.createElement('div');
    spacer.style.width = `${width}px`;
    spacer.style.height = `${space}px`;
    return spacer;
  }

  private getHeight(element) {
    element.style.visibility = 'hidden';
    document.body.appendChild(element);
    const height = element.offsetHeight + 0;
    document.body.removeChild(element);
    element.style.visibility = 'visible';
    return height;
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
}
