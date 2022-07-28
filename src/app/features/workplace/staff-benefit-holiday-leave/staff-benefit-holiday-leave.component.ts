import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-staff-benefit-holiday-leave',
  templateUrl: './staff-benefit-holiday-leave.component.html',
})
export class StaffBenefitHolidayLeaveComponent extends Question implements OnInit, OnDestroy {
  public inStaffRecruitmentFlow: boolean;
  public section: string;
  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  protected init(): void {
    this.setupForm();
    this.prefill();
    this.setPreviousRoute();
    this.inStaffRecruitmentFlow = this.establishmentService.inStaffRecruitmentFlow;

    this.section = this.inStaffRecruitmentFlow ? 'Holiday leave' : 'Staff benefits';
    this.skipRoute = ['/workplace', `${this.establishment.uid}`, 'confirm-staff-recruitment'];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      holidayLeave: null,
    });
  }

  private prefill(): void {
    if (this.establishment.careWorkersLeaveDaysPerYear) {
      this.form.patchValue({
        holidayLeave: this.establishment.careWorkersLeaveDaysPerYear,
      });
    }
  }

  private setPreviousRoute(): void {
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'pensions'];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
