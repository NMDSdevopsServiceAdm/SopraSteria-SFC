import { Component, Input, OnInit } from '@angular/core';
import { BenchmarksResponse, Tile } from '@core/model/benchmarks.model';

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

  public getRankNumber(tileData: Tile): number {
    return undefined;
  }

  public getPositionNumber(tileData: Tile): number {
    return undefined;
  }

  public initialisePositions(): void {
    this.positionData = {
      careWorkerPay: {
        title: 'Care worker pay',
        payMoreThanWorkplacesNumber: this.getPositionNumber(this.data.careWorkerPay),
        totalWorkplaces: 72,
      },
      seniorCareWorkerPay: {
        title: 'Senior care worker pay',
        payMoreThanWorkplacesNumber: this.getPositionNumber(this.data.seniorCareWorkerPay),
        totalWorkplaces: 72
      },
      registeredNursePay: {
        title: 'Registered nurse salary',
        payMoreThanWorkplacesNumber: this.getPositionNumber(this.data.registeredNursePay),
        totalWorkplaces: 72
      },
      registeredManagerPay: {
        title: 'Registered manager salary',
        payMoreThanWorkplacesNumber: this.getPositionNumber(this.data.registeredManagerPay),
        totalWorkplaces: 72
      },
    }
  }

  public initialiseRankings(): void {
    this.rankingData = {
      careWorkerPay: {
        title: 'Care worker pay',
        workplacesRankNumber: this.getRankNumber(this.data.careWorkerPay),
        totalWorkplaces: 72,
      },
      seniorCareWorkerPay: {
        title: 'Senior care worker pay',
        workplacesRankNumber: this.getRankNumber(this.data.seniorCareWorkerPay),
        totalWorkplaces: 72
      },
      registeredNursePay: {
        title: 'Registered nurse salary',
        workplacesRankNumber: this.getRankNumber(this.data.registeredNursePay),
        totalWorkplaces: 72
      },
      registeredManagerPay: {
        title: 'Registered manager salary',
        workplacesRankNumber: this.getRankNumber(this.data.registeredManagerPay),
        totalWorkplaces: 72
      },
    };
  }
}
