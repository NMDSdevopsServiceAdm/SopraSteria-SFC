import { ComponentFactoryResolver, ComponentRef, ElementRef, Injectable, Injector, Type } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { PdfFooterComponent } from '@features/pdf/footer/pdf-footer.component';
import { PdfHeaderComponent } from '@features/pdf/header/pdf-header.component';
import { PdfWorkplaceTitleComponent } from '@features/pdf/workplace-title/pdf-workplace-title.component';
import Canvg from 'canvg';
import { jsPDF } from 'jspdf';

export interface PdfComponent {
  content: ElementRef;
}

export interface Pages {
  current: number;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  public ptToPx = 1.3333333333;
  public scale = 0.5;
  public width = 1000;
  public spacing = 50;
  public y = 20;
  public ypx = (this.y * this.ptToPx) / this.scale;

  constructor(private componentFactoryResolver: ComponentFactoryResolver, private injector: Injector) {}

  public async BuildMetricsPdf(elRef: ElementRef, workplace: Establishment, fileName: string): Promise<jsPDF> {
    const { doc, html } = this.getNewDoc();

    // Page 1
    const pages = {
      current: 1,
      total: 1,
    };

    this.appendHeader(html);
    this.appendWorkplaceTitle(html, workplace);
    this.appendElRef(html, elRef);

    const footerPosition = this.calcFooterPosition(doc, html, 560, pages);
    this.appendFooter(html, footerPosition, pages);

    await this.saveHtmlToPdf(fileName, doc, html, this.scale, this.width);

    return doc;
  }

  public async BuildBenchmarksPdf(
    elRef: ElementRef,
    aboutData: ElementRef,
    workplace: Establishment,
    fileName,
  ): Promise<jsPDF> {
    const { doc, html } = this.getNewDoc();

    // Page 1
    const page = {
      current: 1,
      total: 2,
    };

    this.appendHeader(html);
    this.appendWorkplaceTitle(html, workplace);
    this.appendElRef(html, elRef);

    let footerPosition = this.calcFooterPosition(doc, html, 180, page);
    this.appendFooter(html, footerPosition, page);

    html.append(this.createSpacer(this.width, this.ypx * 2));

    // Page 2
    page.current = 2;
    this.appendHeader(html);
    this.appendAboutData(html, aboutData);

    footerPosition = this.calcFooterPosition(doc, html, 480, page);
    this.appendFooter(html, footerPosition, page);

    await this.convertCharts(html);
    await this.saveHtmlToPdf(fileName, doc, html, this.scale, this.width);

    return doc;
  }

  private getNewDoc() {
    const doc = new jsPDF('p', 'pt', 'a4');
    const html = document.createElement('div');

    html.style.width = `${this.width}px`;
    html.style.display = 'block';

    return { doc, html };
  }

  private appendElRef(html: HTMLElement, elRef: ElementRef): void {
    const elements = elRef.nativeElement.cloneNode(true);
    html.append(elements);
  }

  private appendHeader(html: HTMLElement): void {
    const header = this.resolveComponent(PdfHeaderComponent);

    html.append(this.createSpacer(this.width, 20));
    html.append(header.cloneNode(true));
    html.append(this.createSpacer(this.width, this.spacing));
  }

  private appendFooter(html, footerPosition, pages: Pages): void {
    const footer = this.resolveComponent(PdfFooterComponent, (c) => {
      c.instance.pages = pages;
      c.changeDetectorRef.detectChanges();
    });

    html.append(this.createSpacer(this.width, footerPosition));
    html.append(footer.cloneNode(true));
  }

  private calcFooterPosition = (doc, html: HTMLDivElement, footerPosition: number, pages: Pages) => {
    const a4heightpx = doc.internal.pageSize.getHeight() * this.ptToPx;

    switch (pages.current) {
      case 1: {
        return a4heightpx - this.getHeight(html) * this.scale - (footerPosition * this.scale + this.ypx);
      }
      case 2: {
        return a4heightpx * 2 - this.getHeight(html) * this.scale - (footerPosition * this.scale - this.ypx * 2);
      }
    }
  };

  private appendWorkplaceTitle(html, workplace): void {
    const workplaceTitle = this.resolveComponent(PdfWorkplaceTitleComponent, (c) => {
      c.instance.workplace = workplace;
      c.changeDetectorRef.detectChanges();
    });

    html.append(workplaceTitle.cloneNode(true));
    html.append(this.createSpacer(this.width, this.spacing));
  }

  private appendAboutData(html: HTMLElement, aboutData: ElementRef): void {
    const aboutDataHtml = aboutData.nativeElement.cloneNode(true);
    html.append(aboutDataHtml);
  }

  private async convertListItems(html: HTMLElement) {
    const allUl = Array.from(html.getElementsByTagName('ul'));
    for (const ul of allUl) {
      ul.style.listStyle = 'none';
      ul.style.paddingLeft = '0';
    }

    const allLi = Array.from(html.getElementsByTagName('li'));
    for (const li of allLi) {
      li.textContent = '- ' + li.textContent;
    }
  }

  private async convertCharts(html: HTMLElement): Promise<void> {
    const charts = Array.from(html.getElementsByClassName('highcharts-container'));

    charts.forEach(async (chart): Promise<void> => {
      const svgs = Array.from(chart.querySelectorAll('svg'));

      svgs.forEach(async (svg): Promise<void> => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          let xml = new XMLSerializer().serializeToString(svg);
          // Removing the name space as IE throws an error
          xml = xml.replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, '');

          const v = await Canvg.from(ctx, xml);
          await v.render();

          svg.parentNode.insertBefore(canvas, svg.nextSibling);
          svg.remove();
        } catch (err) {
          console.log(err);
        }
      });
    });
  }

  private async saveHtmlToPdf(filename, doc: jsPDF, html, scale, width): Promise<void> {
    await this.convertCharts(html);
    await this.convertListItems(html);

    const widthHtml = width * scale;
    const x = (doc.internal.pageSize.getWidth() - widthHtml) / 2;
    const y = 0;

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

  private createSpacer(width: number, space: number): HTMLDivElement {
    const spacer = document.createElement('div');

    spacer.style.width = `${width}px`;
    spacer.style.height = `${space}px`;

    return spacer;
  }

  private getHeight(element): number {
    element.style.visibility = 'hidden';
    document.body.appendChild(element);
    const height = element.offsetHeight + 0;
    document.body.removeChild(element);
    element.style.visibility = 'visible';
    return height;
  }

  private resolveComponent<T extends PdfComponent>(
    componentType: Type<T>,
    callback: (c: ComponentRef<T>) => void = () => {
      return;
    },
  ): HTMLElement {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);
    const component = componentFactory.create(this.injector);

    callback(component);

    return component.instance.content.nativeElement as HTMLElement;
  }
}
