import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BenchmarksResponse } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { jsPDF } from 'jspdf';
import { Subscription } from 'rxjs';

import { BenchmarksAboutTheDataComponent } from './about-the-data/about-the-data.component';

@Component({
  selector: 'app-benchmarks-tab',
  templateUrl: './benchmarks-tab.component.html',
  styleUrls: ['./benchmarks-tab.component.scss'],
})
export class BenchmarksTabComponent implements OnInit, OnDestroy {
  protected subscriptions: Subscription = new Subscription();

  @Input() workplace: Establishment;
  @ViewChild('aboutData') private aboutData: BenchmarksAboutTheDataComponent;

  public tilesData: BenchmarksResponse = {
    tiles: {
      pay: {
        workplaceValue:
        {
          value: 0,
          hasValue: false
        },
        comparisonGroup:
        {
          value: 0,
          hasValue: false
        }
      },
      sickness: {
        workplaceValue:
        {
          value: 0,
          hasValue: false
        },
        comparisonGroup:
        {
          value: 0,
          hasValue: false
        }
      },
      qualifications: {
        workplaceValue:
        {
          value: 0,
          hasValue: false
        },
        comparisonGroup:
        {
          value: 0,
          hasValue: false
        }
      },
      turnover: {
        workplaceValue:
        {
          value: 0,
          hasValue: false
        },
        comparisonGroup:
        {
          value: 0,
          hasValue: false
        }
      }
    },
    meta: {
      workplaces: 0,
      staff: 0
    }
  };
  private elref: ElementRef<any>;
  constructor(
    private benchmarksService: BenchmarksService,
    private elRef: ElementRef,
  ) {
    this.elref = elRef;
  }

  ngOnInit() {
    this.subscriptions.add(
      this.benchmarksService.getTileData(this.workplace.uid, ['sickness', 'turnover', 'pay', 'qualifications']).subscribe(
        (data) => {
          if (data) {
            this.tilesData = data;
          }
        }
      ))
  }

  public formatPercent(data) {
    return Math.round(data * 100) + '%';
  }
  public formatPay(data) {
    return '£' + (Number(data) / 100).toFixed(2);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
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

  public async downloadAsPDF($event: Event) {
    $event.preventDefault();
    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const ptToPx = 1.3333333333;
      const a4heightpx = doc.internal.pageSize.getHeight() * ptToPx;
      const scale = 0.5;
      const width = 1000;
      const spacing = 50;
      const widthHtml = width * scale;
      const x = (doc.internal.pageSize.getWidth() - widthHtml) / 2;
      const y = 20;
      const ypx = (y * ptToPx / scale);
      const html2canvas = {
        scale,
        width,
        windowWidth: width
      };
      const html = document.createElement('div');

      html.style.width = `${width}px`;
      html.style.display = 'block';
      html.append(this.benchmarksService.header.nativeElement.cloneNode(true));
      html.append(this.createSpacer(width, spacing));
      html.append(this.benchmarksService.workplaceTitle.nativeElement.cloneNode(true));
      html.append(this.createSpacer(width, spacing));
      html.append(this.elRef.nativeElement.cloneNode(true));
      const footer = this.benchmarksService.footer.nativeElement.cloneNode(true);
      const govuklogo = document.createElement('div');
      govuklogo.className = 'department-of-health-logo__crest';
      govuklogo.style.borderLeft = '2px solid #00ad93';
      govuklogo.style.paddingLeft = '5px';
      const govukimage = document.createElement('img');
      govukimage.src = '/assets/images/govuk-crest.png';
      govukimage.alt= 'Department of Health & Social Care';
      govukimage.style.height = '25px';
      govukimage.style.width = 'auto';
      govukimage.style.float = 'left';
      const govuktext = document.createElement('span');
      govuktext.className = 'department-of-health-logo__name';
      govuktext.innerHTML = '<br clear="left">Department<br>of Health &<br>Social Care';
      govuklogo.append(govukimage);
      govuklogo.append(govuktext);
      footer.append(govuklogo);
      const footerPosition = a4heightpx - (this.getHeight(html) * scale) - ((this.getHeight(footer) * scale) + ypx);
      html.append(this.createSpacer(width, footerPosition));
      html.append(footer.cloneNode(true));
      html.append(this.createSpacer(width, ypx * 2));
      html.append(this.benchmarksService.header.nativeElement.cloneNode(true));
      const aboutDataHtml = this.benchmarksService.aboutData.nativeElement.cloneNode(true);
      const allUl = aboutDataHtml.getElementsByTagName('ul');
      for (let ul of allUl) {
        ul.style.listStyle = 'none';
        ul.style.paddingLeft = '0';
      }
      const allLi = aboutDataHtml.getElementsByTagName('li');
      for (let li of allLi) {
        li.textContent = '- ' + li.textContent
      }
      html.append(aboutDataHtml);
      console.log((a4heightpx * 2),(this.getHeight(html) * scale),((this.getHeight(footer) * scale) + ypx));
      const footerPg2Position = (a4heightpx * 2) - (this.getHeight(html) * scale) - ((this.getHeight(footer) * scale) - (ypx * 2));
      console.log(footerPg2Position);
      html.append(this.createSpacer(width, footerPg2Position));
      html.append(footer.cloneNode(true));
      await doc.html(html, {
        x,
        y,
        html2canvas
      });
      if (doc.getNumberOfPages() > 2) {
        for (let i = doc.getNumberOfPages(); i > 2; i--) {
          doc.deletePage(i);
        }
      }
      doc.save('benchmarks.pdf');
    } catch (error) {
      console.error(error);
    }
  }
}
