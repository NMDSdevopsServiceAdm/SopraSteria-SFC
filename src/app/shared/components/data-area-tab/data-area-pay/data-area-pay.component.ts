import { Component, Input, OnChanges } from '@angular/core';
import {
  AllRankingsResponse,
  BenchmarksResponse,
  BenchmarkValue,
  RankingsResponse,
} from '@core/model/benchmarks.model';
import { FormatUtil } from '@core/utils/format-util';

@Component({
  selector: 'app-data-area-pay',
  templateUrl: './data-area-pay.component.html',
  styleUrls: ['../data-area-tab.component.scss'],
})
export class DataAreaPayComponent implements OnChanges {
  @Input() data: BenchmarksResponse;
  @Input() rankingsData: AllRankingsResponse;
  @Input() viewBenchmarksComparisonGroups: boolean;
  @Input() showRegisteredNurseSalary: boolean;
  public viewBenchmarksPosition = false;
  public careWorkerPay: string;
  public seniorCareWorkerPay: string;
  public registeredNurseSalary: string;
  public registeredManagerSalary: string;
  public comparisionGroupCareWorkerPay: string;
  public comparisionGroupSeniorCareWorkerPay: string;
  public comparisionGroupRegisteredNurseSalary: string;
  public comparisionGroupRegisteredManagerSalary: string;
  public careWorkerRankings: RankingsResponse;
  public seniorCareWorkerRankings: RankingsResponse;
  public registeredNurseRankings: RankingsResponse;
  public registeredManagerRankings: RankingsResponse;

  ngOnChanges(): void {
    this.setWorkplacePayAndSalary();
    this.setComparisionGroupPayAndSalary(this.viewBenchmarksComparisonGroups);
    this.setRankings(this.viewBenchmarksComparisonGroups);
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

  public setComparisionGroupPayAndSalary(isGoodAndOutstanding: boolean): void {
    if (isGoodAndOutstanding) {
      this.comparisionGroupCareWorkerPay = this.formatComparisionGroupPay(this.data?.careWorkerPay.goodCqc);
      this.comparisionGroupSeniorCareWorkerPay = this.formatComparisionGroupPay(this.data?.seniorCareWorkerPay.goodCqc);
      this.comparisionGroupRegisteredNurseSalary = this.formatComparisionGroupSalary(
        this.data?.registeredNursePay.goodCqc,
      );
      this.comparisionGroupRegisteredManagerSalary = this.formatComparisionGroupSalary(
        this.data?.registeredManagerPay.goodCqc,
      );
    } else {
      this.comparisionGroupCareWorkerPay = this.formatComparisionGroupPay(this.data?.careWorkerPay.comparisonGroup);
      this.comparisionGroupSeniorCareWorkerPay = this.formatComparisionGroupPay(
        this.data?.seniorCareWorkerPay.comparisonGroup,
      );
      this.comparisionGroupRegisteredNurseSalary = this.formatComparisionGroupSalary(
        this.data?.registeredNursePay.comparisonGroup,
      );
      this.comparisionGroupRegisteredManagerSalary = this.formatComparisionGroupSalary(
        this.data?.registeredManagerPay.comparisonGroup,
      );
    }
  }

  public setRankings(isGoodAndOutstanding: boolean): void {
    if (isGoodAndOutstanding) {
      this.careWorkerRankings = this.rankingsData.pay.careWorkerPay.goodCqcRankings;
      this.seniorCareWorkerRankings = this.rankingsData.pay.seniorCareWorkerPay.goodCqcRankings;
      this.registeredNurseRankings = this.rankingsData.pay.registeredNursePay.goodCqcRankings;
      this.registeredManagerRankings = this.rankingsData.pay.registeredManagerPay.goodCqcRankings;
    } else {
      this.careWorkerRankings = this.rankingsData.pay.careWorkerPay.groupRankings;
      this.seniorCareWorkerRankings = this.rankingsData.pay.seniorCareWorkerPay.groupRankings;
      this.registeredNurseRankings = this.rankingsData.pay.registeredNursePay.groupRankings;
      this.registeredManagerRankings = this.rankingsData.pay.registeredManagerPay.groupRankings;
    }
  }

  private formatComparisionGroupSalary(data: BenchmarkValue): string {
    return data.hasValue ? `${FormatUtil.formatSalary(data.value)} (annually)` : 'Not enough data';
  }

  private formatComparisionGroupPay(data: BenchmarkValue): string {
    return data.hasValue ? `${FormatUtil.formatMoney(data.value)} (hourly)` : 'Not enough data';
  }

  private formatWorkplaceSalary(data: BenchmarkValue): string {
    return data.hasValue ? `${FormatUtil.formatSalary(data.value)} (annually)` : 'No data added';
  }

  private formatWorkplacePay(data: BenchmarkValue): string {
    return data.hasValue ? `${FormatUtil.formatMoney(data.value)} (hourly)` : 'No data added';
  }
}
