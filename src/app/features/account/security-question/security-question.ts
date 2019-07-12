import { BackService } from '@core/services/back.service';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OnDestroy, OnInit } from '@angular/core';
import { RegistrationService } from '@core/services/registration.service';
import { Router } from '@angular/router';
import { SecurityDetails } from '@core/model/security-details.model';
import { Subscription } from 'rxjs';

export class SecurityQuestion implements OnInit, OnDestroy {
  private formErrorsMap: Array<ErrorDetails>;
  private securityDetailsExist = false;
  private securityDetailsMaxLength = 255;
  private subscriptions: Subscription = new Subscription();
  public callToActionLabel: string;
  public form: FormGroup;
  public submitted = false;

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected registrationService: RegistrationService,
    protected router: Router
  ) {}

  // Get security question
  get getSecurityQuestion() {
    return this.form.get('securityQuestion');
  }

  // Get security answer
  get getSecurityAnswer() {
    return this.form.get('securityAnswer');
  }

  ngOnInit() {
    this.setupForm();
    this.checkExistingSecurityDetails();
    this.setupFormErrorsMap();
    this.setCallToActionLabel();
    this.setBackLink();
  }

  private checkExistingSecurityDetails(): void {
    this.subscriptions.add(
      this.registrationService.securityDetails$.subscribe((securityDetails: SecurityDetails) => {
        if (securityDetails) {
          this.securityDetailsExist = true;
          this.preFillForm(securityDetails);
        }
      })
    );
  }

  private preFillForm(securityDetails: SecurityDetails): void {
    if (securityDetails) {
      this.getSecurityQuestion.setValue(securityDetails.securityQuestion);
      this.getSecurityAnswer.setValue(securityDetails.securityAnswer);
    }
  }

  private setCallToActionLabel(): void {
    const label: string = this.securityDetailsExist ? 'Save and return' : 'Continue';
    this.callToActionLabel = label;
  }

  private setBackLink(): void {
    const route: string = this.securityDetailsExist
      ? '/registration/confirm-account-details'
      : '/registration/create-username';
    this.backService.setBackLink({ url: [route] });
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      securityQuestion: ['', [Validators.required, Validators.maxLength(this.securityDetailsMaxLength)]],
      securityAnswer: ['', [Validators.required, Validators.maxLength(this.securityDetailsMaxLength)]],
    });
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'securityQuestion',
        type: [
          {
            name: 'required',
            message: 'Please enter your security question.',
          },
          {
            name: 'maxlength',
            message: `The security question must be no longer than ${this.securityDetailsMaxLength} characters.`,
          },
        ],
      },
      {
        item: 'securityAnswer',
        type: [
          {
            name: 'required',
            message: 'Please enter your security answer.',
          },
          {
            name: 'maxlength',
            message: `The security answer must be no longer than ${this.securityDetailsMaxLength} characters.`,
          },
        ],
      },
    ];
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.save();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  private save(): void {
    this.registrationService.securityDetails$.next({
      securityQuestion: this.getSecurityQuestion.value,
      securityAnswer: this.getSecurityAnswer.value,
    });

    this.router.navigate(['/registration/confirm-account-details']);
  }

  /**
   * Pass in formGroup or formControl name and errorType
   * Then return error message
   * @param item
   * @param errorType
   */
  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  /**
   * Unsubscribe hook to ensure no memory leaks
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
