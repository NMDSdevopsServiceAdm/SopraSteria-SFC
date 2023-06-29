import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AllRankingsResponse, BenchmarksResponse, RankingsResponse } from '@core/model/benchmarks.model';

@Component({
  selector: 'app-data-area-recruitment-and-retention',
  templateUrl: './data-area-recruitment-and-retention.component.html',
  styleUrls: ['../data-area-tab.component.scss'],
})
export class DataAreaRecruitmentAndRetentionComponent implements OnChanges {
  @Input() data: BenchmarksResponse;
  @Input() rankingsData: AllRankingsResponse;
  @Input() viewBenchmarksComparisonGroups: boolean;
  public viewBenchmarksPosition = false;
  public vacancyRankings: RankingsResponse;
  public turnoverRankings: RankingsResponse;
  public timeInRoleRankings: RankingsResponse;
  public vacancyMaxRank;
  public turnoverMaxRank;
  public timeInRoleMaxRank;
  public vacancyCurrentRank;
  public turnoverCurrentRank;
  public timeInRoleCurrentRank;

  ngOnChanges(): void {
    this.setRankings(this.viewBenchmarksComparisonGroups);
  }

  public handleViewBenchmarkPosition(visible: boolean): void {
    this.viewBenchmarksPosition = visible;
  }

  public setCurrentRank(rankings: RankingsResponse) {
    if (rankings.hasValue) {
      return rankings.currentRank;
    }
  }

  public setMaxRank(rankings: RankingsResponse) {
    if (rankings.maxRank) {
      return rankings.maxRank;
    }
  }

  public setRankings(isGoodAndOutstanding: boolean): void {
    if (isGoodAndOutstanding) {
      this.vacancyRankings = this.rankingsData?.vacancy.goodCqcRankings;
      this.turnoverRankings = this.rankingsData?.turnover.goodCqcRankings;
      this.timeInRoleRankings = this.rankingsData?.timeInRole.goodCqcRankings;
    } else {
      this.vacancyRankings = this.rankingsData?.vacancy.groupRankings;
      this.turnoverRankings = this.rankingsData?.turnover.groupRankings;
      this.timeInRoleRankings = this.rankingsData?.timeInRole.groupRankings;
    }

    this.vacancyMaxRank = this.setMaxRank(this.vacancyRankings);
    this.turnoverMaxRank = this.setMaxRank(this.turnoverRankings);
    this.timeInRoleMaxRank = this.setMaxRank(this.timeInRoleRankings);

    this.vacancyCurrentRank = this.setCurrentRank(this.vacancyRankings);
    this.turnoverCurrentRank = this.setCurrentRank(this.turnoverRankings);
    this.timeInRoleCurrentRank = this.setCurrentRank(this.timeInRoleRankings);
  }
}
