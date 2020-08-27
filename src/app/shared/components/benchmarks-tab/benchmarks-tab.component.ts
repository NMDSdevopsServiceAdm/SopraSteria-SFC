import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { BenchmarksResponse } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import html2canvas from 'html2canvas';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Subscription } from 'rxjs';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
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
  constructor(
    private benchmarksService: BenchmarksService,
    private elRef: ElementRef
  ) {
    this.elRef = elRef;
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
      console.log(this.elRef.nativeElement);
      const canvas = await html2canvas(this.elRef.nativeElement, {
        width: 990
      });
      const image = canvas.toDataURL();
      console.log(image);
      console.log(canvas);
      document.body.appendChild(canvas);
    } catch(error) {
      console.error(error);
    }
  }
}
