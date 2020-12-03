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

export enum ReportType {
  dashboard = 'dashboard',
  metric = 'metric',
}

interface ReportInterface {
  footer(number): number;
}

const reportParams = {
  dashboard: {
    footer: (page) => {
      switch (page) {
        case 1:
          return 380;
        case 2:
          return 480;
      }
    },
  } as ReportInterface,
  metric: {
    footer: (page) => {
      switch (page) {
        case 1:
          return 540;
        case 2:
          return 380;
      }
    },
  } as ReportInterface,
};

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

  public async BuildBenchmarksPdf(
    elRef: ElementRef,
    aboutData: ElementRef,
    workplace: Establishment,
    reportType: ReportType,
    fileName,
  ): Promise<void> {
    const doc = new jsPDF('p', 'pt', 'a4');
    const report = reportParams[reportType];
    const html = document.createElement('div');

    html.style.width = `${this.width}px`;
    html.style.display = 'block';

    // Page 1
    let pageNum = 1;
    this.appendHeader(html);
    this.appendWorkplaceTitle(html, workplace);
    this.appendElRef(html, elRef);
    this.appendFooter(doc, html, report, pageNum);

    if (reportType == 'dashboard') {
      html.append(this.createSpacer(this.width, this.ypx * 2));

      // Page 2
      pageNum = 2;
      this.appendHeader(html);
      this.appendAboutData(html, aboutData);
      this.appendFooter(doc, html, report, pageNum);
    }

    await this.convertCharts(html);
    await this.saveHtmlToPdf(fileName, doc, html, this.y, this.scale, this.width);
  }

  private appendElRef(html: HTMLElement, elRef: ElementRef): void {
    html.append(elRef.nativeElement.cloneNode(true));
  }

  private appendHeader(html: HTMLElement): void {
    const header = this.resolveComponent(PdfHeaderComponent);

    html.append(header.cloneNode(true));
    html.append(this.createSpacer(this.width, this.spacing));
  }

  private appendFooter(doc, html, report, pageNum): void {
    const calcFooterPosition = (html: ElementRef, report: ReportInterface, pageNum: number) => {
      const a4heightpx = doc.internal.pageSize.getHeight() * this.ptToPx;
      const footerPosition = report.footer(pageNum);

      switch (pageNum) {
        case 1: {
          return a4heightpx - this.getHeight(html) * this.scale - (footerPosition * this.scale + this.ypx);
        }
        case 2: {
          return a4heightpx * 2 - this.getHeight(html) * this.scale - (footerPosition * this.scale - this.ypx * 2);
        }
      }
    };

    const footer = this.resolveComponent(PdfFooterComponent);
    const footerPosition = calcFooterPosition(html, report, pageNum);

    html.append(this.createSpacer(this.width, footerPosition));
    html.append(footer.cloneNode(true));
  }

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

    const allUl = aboutDataHtml.getElementsByTagName('ul');
    for (const ul of allUl) {
      ul.style.listStyle = 'none';
      ul.style.paddingLeft = '0';
    }

    const allLi = aboutDataHtml.getElementsByTagName('li');
    for (const li of allLi) {
      li.textContent = '- ' + li.textContent;
    }

    html.append(aboutDataHtml);
  }

  private async convertCharts(html: HTMLElement): Promise<void> {
    const charts = Array.from(html.getElementsByClassName('highcharts-container'));

    charts.forEach(
      async (chart): Promise<void> => {
        const svgs = Array.from(chart.querySelectorAll('svg'));

        svgs.forEach(
          async (svg): Promise<void> => {
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
          },
        );
      },
    );
  }

  private async saveHtmlToPdf(filename, doc, html, y, scale, width): Promise<void> {
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
