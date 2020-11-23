import { Component, Input } from '@angular/core';
import { NoData } from '@core/model/benchmarks.model';

@Component({
  selector: 'app-ranking-content',
  templateUrl: './ranking-content.component.html',
})
export class RankingContentComponent {
  @Input() set hasValue(value: boolean) {
    this.showRank = value;
  }

  @Input() set currentRank(value: number) {
    this.rank = value;
  }

  @Input() set stateMessage(value: string) {
    this.state = value;
    this.showNoRankMessage = value !== 'no-comparison-data';
  }

  @Input() noData: NoData;

  public get message(): string {
    return this.noData[this.state];
  }

  public showRank: boolean;
  public rank: number;
  public state: string;
  public showNoRankMessage: boolean;
}
