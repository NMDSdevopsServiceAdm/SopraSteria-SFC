import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-data-area-ranking',
  templateUrl: './data-area-ranking.component.html',
  styleUrls: ['./data-area-ranking.component.scss'],
})
export class DataAreaRankingComponent {
  @Input() rankingTitle: string;
  @Input() workplaceRankNumber: number;
  @Input() workplacesNumber: number;
}
