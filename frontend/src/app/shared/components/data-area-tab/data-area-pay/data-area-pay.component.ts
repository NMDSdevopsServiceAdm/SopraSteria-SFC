import { Component, Input } from '@angular/core';
import {
  AllRankingsResponse,
  BenchmarksResponse,
  BenchmarkValue,
  RankingsResponse,
} from '@core/model/benchmarks-v2.model';
import { FormatUtil } from '@core/utils/format-util';

@Component({
    selector: 'app-data-area-pay',
    templateUrl: './data-area-pay.component.html',
    styleUrls: ['../data-area-tab.component.scss'],
    standalone: false
})
export class DataAreaPayComponent {
  @Input() data: BenchmarksResponse;
  @Input() rankingsData: AllRankingsResponse;
  @Input() viewBenchmarksComparisonGroups: boolean;
  @Input() showRegisteredNurseSalary: boolean;
  public viewBenchmarksPosition = false;
  public careWorkerPay: string;
  public seniorCareWorkerPay: string;
  public registeredNurseSalary: string;
  public registeredManagerSalary: string;
  public comparisonGroupCareWorkerPay: string;
  public comparisonGroupSeniorCareWorkerPay: string;
  public comparisonGroupRegisteredNurseSalary: string;
  public comparisonGroupRegisteredManagerSalary: string;
  public careWorkerRankings: RankingsResponse;
  public seniorCareWorkerRankings: RankingsResponse;
  public registeredNurseRankings: RankingsResponse;
  public registeredManagerRankings: RankingsResponse;
  public rankings;
  public positionData;
  private noComparisonDataState = 'no-comparison-data';

  ngOnChanges(): void {
    this.setWorkplacePayAndSalary();
    this.setComparisonGroupPayAndSalary(this.viewBenchmarksComparisonGroups);
    this.setRankings(this.viewBenchmarksComparisonGroups);
    this.initialiseRankings();
  }

  public handleViewBenchmarkPosition(visible: boolean): void {
    this.viewBenchmarksPosition = visible;
  }

  public setWorkplacePayAndSalary(): void {
    this.careWorkerPay = this.formatWorkplacePay(this.data.careWorkerPay.workplaceValue);
    this.seniorCareWorkerPay = this.formatWorkplacePay(this.data.seniorCareWorkerPay.workplaceValue);
    this.registeredNurseSalary = this.formatWorkplaceSalary(this.data.registeredNursePay.workplaceValue);
    this.registeredManagerSalary = this.formatWorkplaceSalary(this.data.registeredManagerPay.workplaceValue);
  }

  public setComparisonGroupPayAndSalary(isGoodAndOutstanding: boolean): void {
    if (isGoodAndOutstanding) {
      this.comparisonGroupCareWorkerPay = this.formatComparisonGroupPay(this.data?.careWorkerPay.goodCqc);
      this.comparisonGroupSeniorCareWorkerPay = this.formatComparisonGroupPay(this.data?.seniorCareWorkerPay.goodCqc);
      this.comparisonGroupRegisteredNurseSalary = this.formatComparisonGroupSalary(
        this.data?.registeredNursePay.goodCqc,
      );
      this.comparisonGroupRegisteredManagerSalary = this.formatComparisonGroupSalary(
        this.data?.registeredManagerPay.goodCqc,
      );
    } else {
      this.comparisonGroupCareWorkerPay = this.formatComparisonGroupPay(this.data?.careWorkerPay.comparisonGroup);
      this.comparisonGroupSeniorCareWorkerPay = this.formatComparisonGroupPay(
        this.data?.seniorCareWorkerPay.comparisonGroup,
      );
      this.comparisonGroupRegisteredNurseSalary = this.formatComparisonGroupSalary(
        this.data?.registeredNursePay.comparisonGroup,
      );
      this.comparisonGroupRegisteredManagerSalary = this.formatComparisonGroupSalary(
        this.data?.registeredManagerPay.comparisonGroup,
      );
    }
  }

  public setRankings(isGoodAndOutstanding: boolean): void {
    if (isGoodAndOutstanding) {
      this.careWorkerRankings = this.rankingsData?.pay.careWorkerPay.goodCqcRankings;
      this.seniorCareWorkerRankings = this.rankingsData?.pay.seniorCareWorkerPay.goodCqcRankings;
      this.registeredNurseRankings = this.rankingsData?.pay.registeredNursePay.goodCqcRankings;
      this.registeredManagerRankings = this.rankingsData?.pay.registeredManagerPay.goodCqcRankings;
    } else {
      this.careWorkerRankings = this.rankingsData?.pay.careWorkerPay.groupRankings;
      this.seniorCareWorkerRankings = this.rankingsData?.pay.seniorCareWorkerPay.groupRankings;
      this.registeredNurseRankings = this.rankingsData?.pay.registeredNursePay.groupRankings;
      this.registeredManagerRankings = this.rankingsData?.pay.registeredManagerPay.groupRankings;
    }
  }

  private formatComparisonGroupSalary(data: BenchmarkValue): string {
    return data.hasValue ? `${FormatUtil.formatSalary(data.value)} (annually)` : 'Not enough data';
  }

  private formatComparisonGroupPay(data: BenchmarkValue): string {
    return data.hasValue ? `${FormatUtil.formatMoney(data.value)} (hourly)` : 'Not enough data';
  }

  private formatWorkplaceSalary(data: BenchmarkValue): string {
    return data.hasValue ? `${FormatUtil.formatSalary(data.value)} (annually)` : 'No data added';
  }

  private formatWorkplacePay(data: BenchmarkValue): string {
    return data.hasValue ? `${FormatUtil.formatMoney(data.value)} (hourly)` : 'No data added';
  }

  public getRankNumber(rank: RankingsResponse): number {
    if (rank.hasValue) {
      return rank.currentRank;
    }
    return undefined;
  }

  public getMaxRank(rank: RankingsResponse): number {
    if (rank.stateMessage !== this.noComparisonDataState) {
      return rank.maxRank;
    }
    return undefined;
  }

  public hasWorkplaceData(rank: RankingsResponse): boolean {
    return rank.allValues?.length == 0;
  }

  public initialiseRankings(): void {
    this.rankings = {
      careWorkerPay: {
        title: 'Care worker pay',
        workplacesRankNumber: this.getRankNumber(this.careWorkerRankings),
        totalWorkplaces: this.getMaxRank(this.careWorkerRankings),
        noWorkplaceData: this.hasWorkplaceData(this.careWorkerRankings),
      },
      seniorCareWorkerPay: {
        title: 'Senior care worker pay',
        workplacesRankNumber: this.getRankNumber(this.seniorCareWorkerRankings),
        totalWorkplaces: this.getMaxRank(this.seniorCareWorkerRankings),
        noWorkplaceData: this.hasWorkplaceData(this.seniorCareWorkerRankings),
      },
      registeredNursePay: {
        title: 'Registered nurse salary',
        workplacesRankNumber: this.getRankNumber(this.registeredNurseRankings),
        totalWorkplaces: this.getMaxRank(this.registeredNurseRankings),
        noWorkplaceData: this.hasWorkplaceData(this.registeredNurseRankings),
      },
      registeredManagerPay: {
        title: 'Registered manager salary',
        workplacesRankNumber: this.getRankNumber(this.registeredManagerRankings),
        totalWorkplaces: this.getMaxRank(this.registeredManagerRankings),
        noWorkplaceData: this.hasWorkplaceData(this.registeredManagerRankings),
      },
    };
  }
}
