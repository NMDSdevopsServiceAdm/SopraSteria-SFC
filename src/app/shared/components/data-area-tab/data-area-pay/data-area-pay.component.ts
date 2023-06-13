import { Component, Input, OnChanges } from '@angular/core';
import { BenchmarksResponse } from '@core/model/benchmarks.model';
import { FormatUtil } from '@core/utils/format-util';

@Component({
  selector: 'app-data-area-pay',
  templateUrl: './data-area-pay.component.html',
  styleUrls: ['../data-area-tab.component.scss'],
})
export class DataAreaPayComponent implements OnChanges {
  @Input() data: BenchmarksResponse;
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
  public formatMoney = FormatUtil.formatMoney;
  public formatSalary = FormatUtil.formatSalary;

  ngOnChanges(): void {
    this.showWorkplacePayAndSalary();
    this.showComparisionGroupPayAndSalary();
  }

  public handleViewBenchmarkPosition(visible: boolean): void {
    this.viewBenchmarksPosition = visible;
  }

  public showWorkplacePayAndSalary(): void {
    this.careWorkerPay = this.data.careWorkerPay.workplaceValue.hasValue
      ? `${this.formatMoney(this.data?.careWorkerPay.workplaceValue.value)} (hourly)`
      : 'No data added';
    this.seniorCareWorkerPay = this.data.seniorCareWorkerPay.workplaceValue.hasValue
      ? `${this.formatMoney(this.data?.seniorCareWorkerPay.workplaceValue.value)} (hourly)`
      : 'No data added';
    this.registeredNurseSalary = this.data.registeredNursePay.workplaceValue.hasValue
      ? `${this.formatSalary(this.data?.registeredNursePay.workplaceValue.value)} (annually)`
      : 'No data added';
    this.registeredManagerSalary = this.data.registeredManagerPay.workplaceValue.hasValue
      ? `${this.formatSalary(this.data?.registeredManagerPay.workplaceValue.value)} (annually)`
      : 'No data added';
  }

  public showComparisionGroupPayAndSalary(): void {
    if (this.viewBenchmarksComparisonGroups) {
      this.comparisionGroupCareWorkerPay = this.data?.careWorkerPay.goodCqc.hasValue
        ? `${this.formatMoney(this.data?.careWorkerPay.goodCqc.value)} (hourly)`
        : 'Not enough data';
      this.comparisionGroupSeniorCareWorkerPay = this.data?.seniorCareWorkerPay.goodCqc.hasValue
        ? `${this.formatMoney(this.data?.seniorCareWorkerPay.goodCqc.value)} (hourly)`
        : 'Not enough data';
      this.comparisionGroupRegisteredNurseSalary = this.data?.registeredNursePay.goodCqc.hasValue
        ? `${this.formatSalary(this.data?.registeredNursePay.goodCqc.value)} (annually)`
        : 'Not enough data';
      this.comparisionGroupRegisteredManagerSalary = this.data?.registeredManagerPay.goodCqc.hasValue
        ? `${this.formatSalary(this.data?.registeredManagerPay.goodCqc.value)} (annually)`
        : 'Not enough data';
    } else {
      this.comparisionGroupCareWorkerPay = this.data?.careWorkerPay.comparisonGroup.hasValue
        ? `${this.formatMoney(this.data?.careWorkerPay.comparisonGroup.value)} (hourly)`
        : 'Not enough data';
      this.comparisionGroupSeniorCareWorkerPay = this.data?.seniorCareWorkerPay.comparisonGroup.hasValue
        ? `${this.formatMoney(this.data?.seniorCareWorkerPay.comparisonGroup.value)} (hourly)`
        : 'Not enough data';
      this.comparisionGroupRegisteredNurseSalary = this.data?.registeredNursePay.comparisonGroup.hasValue
        ? `${this.formatSalary(this.data?.registeredNursePay.comparisonGroup.value)} (annually)`
        : 'Not enough data';
      this.comparisionGroupRegisteredManagerSalary = this.data?.registeredManagerPay.comparisonGroup.hasValue
        ? `${this.formatSalary(this.data?.registeredManagerPay.comparisonGroup.value)} (annually)`
        : 'Not enough data';
    }
  }
}
