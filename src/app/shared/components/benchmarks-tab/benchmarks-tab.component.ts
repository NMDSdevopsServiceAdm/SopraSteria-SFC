import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Subscription } from 'rxjs';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { Benchmarks } from '@core/model/benchmarks.model';

@Component({
  selector: 'app-benchmarks-tab',
  templateUrl: './benchmarks-tab.component.html'
})
export class BenchmarksTabComponent implements OnInit, OnDestroy {
  protected subscriptions: Subscription = new Subscription();

  @Input() workplace: Establishment;
  public tilesData: Benchmarks;
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
           if (data.tiles.pay ){
             this.tilesData.tiles.pay.showYourWorkplace = !data.tiles.pay.workplaceValue.stateMessage;
             this.tilesData.tiles.pay.showComparisonGroup = !data.tiles.pay.comparisonGroup.stateMessage;

           }
          }
        }
      ))
  }

  ngOnDestroy() {
  }
}
