import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Subscription } from 'rxjs';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { BenchmarksResponse } from '@core/model/benchmarks.model';

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
          },
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
        }
    },
    meta:{}
  };
  public tileDemo: any = {
    turnover: {
      showYourWorkplace: true,
      showComparisonGroup: true
    },
    pay: {
      showYourWorkplace: true,
      showComparisonGroup: false
    },
    sickness: {
      showYourWorkplace: false,
      showComparisonGroup: true
    },
    qualifications: {
      showYourWorkplace: false,
      showComparisonGroup: false
    }
  };
  constructor(
    private benchmarksService: BenchmarksService
  ) {

  }

  ngOnInit() {
    this.subscriptions.add(
      this.benchmarksService.getAllTiles(this.workplace.uid).subscribe(
        (data) => {
          if (data) {
            this.tilesData = data;
          }
        }
      ))
  }

  public formatPercent(data) {
    return Math.round(data * 100) + '%'
  }
  public formatPay(data) {
    return  '£' + Number(data).toFixed(2);
  }

  ngOnDestroy() {
  }
}
