import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';

@Component({
  selector: 'app-benchmarks-tab',
  templateUrl: './benchmarks-tab.component.html'
})
export class BenchmarksTabComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;

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
  ) {

  }

  ngOnInit() {

  }

  ngOnDestroy() {
  }
}
