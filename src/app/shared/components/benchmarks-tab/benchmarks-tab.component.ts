import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { BenchmarksResponse } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { jsPDF } from 'jspdf';
import { cloneDeep } from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-benchmarks-tab',
  templateUrl: './benchmarks-tab.component.html'
})
export class BenchmarksTabComponent implements OnInit, OnDestroy {
  protected subscriptions: Subscription = new Subscription();

  @Input() workplace: Establishment;

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
    private elRef: ElementRef
    ) {
    this.elref = elRef;
  }

  ngOnInit() {
    this.subscriptions.add(
      this.benchmarksService.getTileData(this.workplace.uid,['sickness','turnover','pay','qualifications']).subscribe(
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
    return  '£' + (Number(data) / 100).toFixed(2);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public async downloadAsPDF($event: Event) {
    $event.preventDefault();
    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const a4width = 595.28;
      const scale = 0.5;
      const html = cloneDeep(this.elRef.nativeElement);
      const widthHtml = html.offsetWidth * scale;
      const x = (a4width - widthHtml) / 2;
      const html2canvas = {
        scale
      };

      html.prepend(document.getElementsByTagName('header').item(0));

      // await doc.html(document.getElementsByTagName('header').item(0), {
      //   x,
      //   y: 20,
      //   html2canvas
      // });
      await doc.html(html, {
        x,
        y: 100,
        html2canvas,
        jsPDF: doc
      });

      const page2 = doc.addPage('a4', 'p');
      console.log(page2);
      await page2.html(html, {
        x,
        y: 20,
        html2canvas,
        jsPDF: page2
      })

      doc.save('benchmarks.pdf');
    } catch(error) {
      console.error(error);
    }
  }
}
