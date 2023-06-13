import { Component, Input, OnInit } from '@angular/core';
import { BenchmarksResponse } from '@core/model/benchmarks.model';

@Component({
  selector: 'app-data-area-pay',
  templateUrl: './data-area-pay.component.html',
  styleUrls: ['../data-area-tab.component.scss'],
})
export class DataAreaPayComponent implements OnInit {
  @Input() data: BenchmarksResponse;
  public viewBenchmarksPosition = false;
  public rankingData;
  public positionData;

  ngOnInit(): void {
    this.initialiseRankings();
    this.initialisePositions();
  }

  public handleViewBenchmarkPosition(visible: boolean): void {
    this.viewBenchmarksPosition = visible;
  }

  public initialisePositions(): void {
    this.positionData = {
      careWorkerPay: {
        title: 'Care worker pay',
        payMoreThanWorkplacesNumber: undefined,
        totalWorkplaces: 72,
      },
      seniorCareWorkerPay: {
        title: 'Senior care worker pay',
        payMoreThanWorkplacesNumber: undefined,
        totalWorkplaces: 72
      },
      registeredNursePay: {
        title: 'Registered nurse salary',
        payMoreThanWorkplacesNumber: undefined,
        totalWorkplaces: 72
      },
      registeredManagerPay: {
        title: 'Registered manager salary',
        payMoreThanWorkplacesNumber: undefined,
        totalWorkplaces: 72
      },
    }
  }

  public initialiseRankings(): void {
    this.rankingData = {
      careWorkerPay: {
        title: 'Care worker pay',
        workplacesRankNumber: undefined,
        totalWorkplaces: 72,
      },
      seniorCareWorkerPay: {
        title: 'Senior care worker pay',
        workplacesRankNumber: undefined,
        totalWorkplaces: 72
      },
      registeredNursePay: {
        title: 'Registered nurse salary',
        workplacesRankNumber: undefined,
        totalWorkplaces: 72
      },
      registeredManagerPay: {
        title: 'Registered manager salary',
        workplacesRankNumber: undefined,
        totalWorkplaces: 72
      },
    };
  }
}
