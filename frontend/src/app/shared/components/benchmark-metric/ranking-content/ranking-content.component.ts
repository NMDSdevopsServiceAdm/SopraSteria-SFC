import { Component, Input } from '@angular/core';
import { NoData } from '@core/model/benchmarks.model';

export interface RankingContent {
  stateMessage?: string;
  currentRank?: number;
  hasValue?: boolean;
  noData: NoData;
  smallText?: boolean;
}

@Component({
    selector: 'app-ranking-content',
    templateUrl: './ranking-content.component.html',
    standalone: false
})
export class RankingContentComponent {
  @Input() set content(value: RankingContent) {
    this.showRank = value.hasValue;
    this.rank = value.currentRank;
    this.state = value.stateMessage;
    this.showNoRankMessage = value.stateMessage !== 'no-comparison-data';
    this.smallText = value.smallText;
    this.message = value.noData[this.state];
  }

  public showRank: boolean;
  public rank: number;
  public state: string;
  public showNoRankMessage: boolean;
  public smallText = false;
  public message: string;
}
