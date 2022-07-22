import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StaffBenefitEnum } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-staff-benefit-cash-loyalty',
  templateUrl: './staff-benefit-cash-loyalty.component.html',
})
export class StaffBenefitCashLoyaltyComponent extends Question implements OnInit, OnDestroy {
  public cashLoyaltyRequiredOptions = [
    {
      label: 'Yes',
      value: StaffBenefitEnum.YES,
    },
    {
      label: 'No',
      value: StaffBenefitEnum.NO,
    },
    {
      label: "Don't know",
      value: StaffBenefitEnum.DONT_KNOW,
    },
  ];

  public showTextBox = false;
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
    {
      this.form = this.formBuilder.group({
        cashLoyalty: [
          null,
          {
            validators: Validators.required,
            updateOn: 'submit',
          },
        ],
      });
    }
  }

  protected init(): void {
    this.setPreviousRoute();
    this.inStaffRecruitmentFlow = this.establishmentService.inStaffRecruitmentFlow;
    this.section = this.inStaffRecruitmentFlow ? 'Loyalty bonus' : 'Staff benefits';
    this.skipRoute = ['/workplace', `${this.establishment.uid}`, 'sick-pay'];
  }

  private setPreviousRoute(): void {
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'accept-previous-care-certificate'];
  }

  public onChange(answer: string) {
    if (answer === 'Yes') {
      this.showTextBox = true;
      this.addControl();
    } else if (answer) {
      this.showTextBox = false;
      const { cashAmount } = this.form.controls;
      if (cashAmount) {
        this.form.removeControl('cashAmount');
      }
    }
  }

  public addControl() {
    this.form.addControl('cashAmount', new FormControl(null, { updateOn: 'submit' }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
