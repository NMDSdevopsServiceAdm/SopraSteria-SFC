import { Component, Input, OnChanges } from '@angular/core';
import {
  AllRankingsResponse,
  BenchmarksResponse,
  BenchmarkValue,
  RankingsResponse,
} from '@core/model/benchmarks-v2.model';
import { FormatUtil } from '@core/utils/format-util';

@Component({
    selector: 'app-data-area-recruitment-and-retention',
    templateUrl: './data-area-recruitment-and-retention.component.html',
    styleUrls: ['../data-area-tab.component.scss'],
    standalone: false
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
  public vacancyNoWorkplaceData: boolean;
  public turnoverNoWorkplaceData: boolean;
  public timeInRoleNoWorkplaceData: boolean;
  public vacancyComparisonGroupData: string;
  public turnoverComparisonGroupData: string;
  public timeInRoleComparisonGroupData: string;
  public vacancyWorkplaceData: string;
  public turnoverWorkplaceData: string;
  public timeInRoleWorkplaceData: string;

  ngOnChanges(): void {
    this.setRankings(this.viewBenchmarksComparisonGroups);
    this.setComparisonTableData(this.viewBenchmarksComparisonGroups);
  }

  public handleViewBenchmarkPosition(visible: boolean): void {
    this.viewBenchmarksPosition = visible;
  }

  public formatComparisionGroup(data: BenchmarkValue): string {
    return data.hasValue ? FormatUtil.formatPercent(data.value) : 'Not enough data';
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

  public hasWorkplaceData(rank: RankingsResponse): boolean {
    return rank.allValues?.length == 0;
  }

  private formatComparisonGroupTableData(data: BenchmarkValue): string {
    return data.hasValue ? `${FormatUtil.formatPercent(data.value)}` : 'Not enough data';
  }

  private formatWorkplaceTableData(data: BenchmarkValue): string {
    return data.hasValue ? `${FormatUtil.formatPercent(data.value)}` : 'No data added';
  }

  public setComparisonTableData(isGoodAndOutstanding: boolean): void {
    this.vacancyWorkplaceData = this.formatWorkplaceTableData(this.data.vacancyRate.workplaceValue);
    this.turnoverWorkplaceData = this.formatWorkplaceTableData(this.data.turnoverRate.workplaceValue);
    this.timeInRoleWorkplaceData = this.formatWorkplaceTableData(this.data.timeInRole.workplaceValue);
    if (isGoodAndOutstanding) {
      this.vacancyComparisonGroupData = this.formatComparisonGroupTableData(this.data.vacancyRate.goodCqc);
      this.turnoverComparisonGroupData = this.formatComparisonGroupTableData(this.data.turnoverRate.goodCqc);
      this.timeInRoleComparisonGroupData = this.formatComparisonGroupTableData(this.data.timeInRole.goodCqc);
    } else {
      this.vacancyComparisonGroupData = this.formatComparisonGroupTableData(this.data.vacancyRate.comparisonGroup);
      this.turnoverComparisonGroupData = this.formatComparisonGroupTableData(this.data.turnoverRate.comparisonGroup);
      this.timeInRoleComparisonGroupData = this.formatComparisonGroupTableData(this.data.timeInRole.comparisonGroup);
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

    this.vacancyNoWorkplaceData = this.hasWorkplaceData(this.vacancyRankings);
    this.turnoverNoWorkplaceData = this.hasWorkplaceData(this.turnoverRankings);
    this.timeInRoleNoWorkplaceData = this.hasWorkplaceData(this.timeInRoleRankings);
  }
}
