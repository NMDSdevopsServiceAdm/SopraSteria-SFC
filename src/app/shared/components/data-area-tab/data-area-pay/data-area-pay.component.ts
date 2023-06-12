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
      ? `${this.formatMoney(this.data?.registeredNursePay.workplaceValue.value)} (annually)`
      : 'No data added';
    this.registeredManagerSalary = this.data.registeredManagerPay.workplaceValue.hasValue
      ? `${this.formatMoney(this.data?.registeredManagerPay.workplaceValue.value)} (annually)`
      : 'No data added';
  }

  public showComparisionGroupPayAndSalary(): void {
    if (this.viewBenchmarksComparisonGroups) {
      this.comparisionGroupCareWorkerPay = `${this.formatMoney(this.data?.careWorkerPay.goodCqc.value)} (hourly)`;
      this.comparisionGroupSeniorCareWorkerPay = `${this.formatMoney(
        this.data?.seniorCareWorkerPay.goodCqc.value,
      )} (hourly)`;
      this.comparisionGroupRegisteredNurseSalary = `${this.formatSalary(
        this.data?.registeredNursePay.goodCqc.value,
      )} (annually)`;
      this.comparisionGroupRegisteredManagerSalary = `${this.formatSalary(
        this.data?.registeredManagerPay.goodCqc.value,
      )} (annually)`;
    } else {
      this.comparisionGroupCareWorkerPay = `${this.formatMoney(
        this.data?.careWorkerPay.comparisonGroup.value,
      )} (hourly)`;
      this.comparisionGroupSeniorCareWorkerPay = `${this.formatMoney(
        this.data?.seniorCareWorkerPay.comparisonGroup.value,
      )} (hourly)`;
      this.comparisionGroupRegisteredNurseSalary = `${this.formatSalary(
        this.data?.registeredNursePay.comparisonGroup.value,
      )} (annually)`;
      this.comparisionGroupRegisteredManagerSalary = `${this.formatSalary(
        this.data?.registeredManagerPay.comparisonGroup.value,
      )} (annually)`;
    }
  }
}
