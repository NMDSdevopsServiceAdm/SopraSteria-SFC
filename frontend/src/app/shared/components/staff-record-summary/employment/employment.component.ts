import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Contracts } from '@core/model/contracts.enum';
import { EthnicityService } from '@core/services/ethnicity.service';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WdfConfirmFieldsService } from '@core/services/wdf/wdf-confirm-fields.service';
import { WorkerService } from '@core/services/worker.service';
import dayjs from 'dayjs';
import isNumber from 'lodash/isNumber';

import { StaffRecordSummaryComponent } from '../staff-record-summary.component';

@Component({
  selector: 'app-employment',
  templateUrl: './employment.component.html',
  providers: [DecimalPipe],
})
export class EmploymentComponent extends StaffRecordSummaryComponent {
  @Input() wdfView = false;
  @Input() overallWdfEligibility: boolean;
  @Input() public canEditWorker: boolean;

  constructor(
    permissionsService: PermissionsService,
    workerService: WorkerService,
    wdfConfirmFieldsService: WdfConfirmFieldsService,
    route: ActivatedRoute,
    ethnicityService: EthnicityService,
    internationalRecruitmentService: InternationalRecruitmentService,
  ) {
    super(
      permissionsService,
      workerService,
      wdfConfirmFieldsService,
      route,
      ethnicityService,
      internationalRecruitmentService,
    );
  }

  isNumber(number: number) {
    return isNumber(number);
  }

  get displayMentalHealthProfessional() {
    return this.workerService.hasJobRole(this.worker, 27);
  }

  get displayNursingQuestions() {
    return this.workerService.hasJobRole(this.worker, 23);
  }

  get displayDaysSickness() {
    return [Contracts.Permanent, Contracts.Temporary].includes(this.worker.contract);
  }

  get displayAverageWeeklyHours() {
    return (
      this.worker.zeroHoursContract === 'Yes' ||
      [Contracts.Agency, Contracts.Pool_Bank, Contracts.Other].includes(this.worker.contract)
    );
  }

  get displayWeeklyContractedHours() {
    return !this.displayAverageWeeklyHours;
  }

  get mainStartDate() {
    return dayjs(this.worker.mainJobStartDate).format('D MMMM YYYY');
  }

  get displayHealthAndCareVisa() {
    return this.internationalRecruitmentService.shouldSeeInternationalRecruitmentQuestions(this.worker);
  }

  get displayEmployedFromOutsideOrInsideUk() {
    return this.worker.healthAndCareVisa === 'Yes';
  }

  get displayEmployedFromOutsideOrInsideUkValue() {
    return this.internationalRecruitmentService.getEmployedFromOutsideUkStaffRecordValue(
      this.worker.employedFromOutsideUk,
    );
  }

  public showWdfConfirmations: any = {
    mainJobStartDate: null,
    daysSick: null,
    zeroHoursContract: null,
    weeklyHoursAverage: null,
    weeklyHoursContracted: null,
    annualHourlyPay: null,
  };

  protected setShowWdfConfirmations(): void {
    this.showWdfConfirmations = {
      mainJobStartDate: this.showWdfConfirmation('mainJobStartDate'),
      daysSick: this.showWdfConfirmation('daysSick'),
      zeroHoursContract: this.showWdfConfirmation('zeroHoursContract'),
      weeklyHoursAverage: this.showWdfConfirmation('weeklyHoursAverage'),
      weeklyHoursContracted: this.showWdfConfirmation('weeklyHoursContracted'),
      annualHourlyPay: this.showWdfConfirmation('annualHourlyPay'),
    };
  }

  ngOnChanges(): void {
    this.setShowWdfConfirmations();
  }

  public showWdfConfirmation(field: string): boolean {
    return (
      this.canEditWorker &&
      this.wdfView &&
      this.worker.wdf?.[field].isEligible === 'Yes' &&
      !this.worker.wdf?.[field].updatedSinceEffectiveDate
    );
  }
}
