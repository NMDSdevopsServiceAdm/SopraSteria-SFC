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
  dashboard,
  pay,
  turnover,
  sickness,
  qualifications,
}

const reportParams = {
  0: {
    reportName: 'Benchmarks.pdf',
    footer1: 380,
    footer2: 480,
  },
  1: {
    reportName: 'Benchmarks-Pay.pdf',
    footer1: 540,
    footer2: 380,
  },
};

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor(private componentFactoryResolver: ComponentFactoryResolver, private injector: Injector) {}

  public async BuildBenchmarksPdf(
    elRef: ElementRef,
    aboutData: ElementRef,
    workplace: Establishment,
    reportType: ReportType,
  ) {
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

    const footerPosition = a4heightpx - this.getHeight(html) * scale - (reportParams[reportType].footer1 * scale + ypx);
    html.append(this.createSpacer(width, footerPosition));
    html.append(footer.cloneNode(true));
    html.append(this.createSpacer(width, ypx * 2));

    html.append(header.cloneNode(true));

    html.append(this.createSpacer(width, spacing));

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
    const footerPg2Position =
      a4heightpx * 2 - this.getHeight(html) * scale - (reportParams[reportType].footer2 * scale - ypx * 2);
    html.append(this.createSpacer(width, footerPg2Position));
    html.append(footer.cloneNode(true));

    await this.convertCharts(html);

    await this.saveHtmlToPdf(reportParams[reportType].reportName, doc, html, y, scale, width);

    return doc;
  }

  private async convertCharts(html: HTMLElement) {
    const charts = html.getElementsByClassName('highcharts-container');

    await charts.forEach(async function (chart) {
      const svgs = chart.querySelectorAll('svg');
      await svgs.forEach(async (svg) => {
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
    callback: (c: ComponentRef<T>) => void = () => {
      return;
    },
  ) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);
    const component = componentFactory.create(this.injector);

    callback(component);

    return component.instance.content.nativeElement;
  }
}
