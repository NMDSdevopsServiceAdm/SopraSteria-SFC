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
    this.inStaffRecruitmentFlow = this.establishmentService.inStaffRecruitmentFlow;

    this.section = this.inStaffRecruitmentFlow ? 'Holiday leave' : 'Staff benefits';
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      holidayLeave: null,
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
