import { Component, Input, OnChanges, OnInit } from '@angular/core';
import {
  AllRankingsResponse,
  BenchmarksResponse,
  RankingsResponse,
  BenchmarkValue,
} from '@core/model/benchmarks.model';
import { FormatUtil } from '@core/utils/format-util';

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
  public vacancyComparisionGroup;
  public turnoverComparisionGroup;
  public timeInRoleComparisionGroup;

  ngOnChanges(): void {
    this.setRankings(this.viewBenchmarksComparisonGroups);
    this.setComparisonGroupRecruitmentAndRetention(this.viewBenchmarksComparisonGroups);
  }

  public handleViewBenchmarkPosition(visible: boolean): void {
    this.viewBenchmarksPosition = visible;
  }

  public formatComparisionGroup(data: BenchmarkValue): string {
    return data.hasValue ? FormatUtil.formatPercent(data.value) : 'Not enough data';
  }

  public setComparisonGroupRecruitmentAndRetention(isGoodAndOutstanding: boolean): void {
    if (isGoodAndOutstanding) {
      this.vacancyComparisionGroup = this.formatComparisionGroup(this.data?.vacancyRate.goodCqc);
      this.turnoverComparisionGroup = this.formatComparisionGroup(this.data?.turnoverRate.goodCqc);
      this.timeInRoleComparisionGroup = this.formatComparisionGroup(this.data?.timeInRole.goodCqc);
    } else {
      this.vacancyComparisionGroup = this.formatComparisionGroup(this.data?.vacancyRate.comparisonGroup);
      this.turnoverComparisionGroup = this.formatComparisionGroup(this.data?.turnoverRate.comparisonGroup);
      this.timeInRoleComparisionGroup = this.formatComparisionGroup(this.data?.timeInRole.comparisonGroup);
    }
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
