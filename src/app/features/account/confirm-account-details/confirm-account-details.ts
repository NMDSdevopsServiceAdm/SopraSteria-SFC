import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { LocationAddress } from '@core/model/location.model';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { OnDestroy, OnInit } from '@angular/core';
import { SecurityDetails } from '@core/model/security-details.model';
import { Service } from '@core/model/services.model';
import { Subscription } from 'rxjs';
import { SummaryList } from '@core/model/summary-list.model';
import { UserDetails } from '@core/model/userDetails.model';

export class ConfirmAccountDetails implements OnInit, OnDestroy {
  protected formErrorsMap: Array<ErrorDetails>;
  protected locationAddress: LocationAddress;
  protected serverErrorsMap: Array<ErrorDefinition>;
  protected subscriptions: Subscription = new Subscription();
  protected service: Service;
  public userInfo: SummaryList[];
  public loginInfo: SummaryList[];
  public securityInfo: SummaryList[];
  public form: FormGroup;
  public loginCredentials: LoginCredentials;
  public securityDetails: SecurityDetails;
  public serverError: string;
  public submitted = false;
  public userDetails: UserDetails;
  protected actionType: string;

  constructor(
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    this.setupForm();
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.init();
  }

  protected init(): void {}

  private setupForm(): void {
    this.form = this.formBuilder.group({
      termsAndConditions: [null, Validators.required],
    });
  }

  protected setupSubscriptions(): void {}

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'termsAndConditions',
        type: [
          {
            name: 'required',
            message: 'Please agree to the terms and conditions.',
          },
        ],
      },
    ];
  }

  private setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 400,
        message: `${this.actionType} failed.`,
      },
      {
        name: 401,
        message: 'Unauthorized.',
      },
    ];
  }

  protected setBackLink(): void {}

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.save();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  protected save(): void {}

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  protected onError(error: HttpErrorResponse): void {
    this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }

  /**
   * Unsubscribe hook to ensure no memory leaks
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
