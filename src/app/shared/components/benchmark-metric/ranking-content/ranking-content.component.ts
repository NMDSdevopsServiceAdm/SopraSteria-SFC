import { Component, Input } from '@angular/core';

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
  }

  public showRank: boolean;
  public rank: number;
  public state: string;
}
