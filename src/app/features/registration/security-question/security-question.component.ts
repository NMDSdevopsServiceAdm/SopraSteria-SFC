import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { SecurityDetails } from '@core/model/security-details.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-security-question',
  templateUrl: './security-question.component.html',
})
export class SecurityQuestionComponent implements OnInit, OnDestroy {
  private callToActionLabel: string;
  private form: FormGroup;
  private formErrorsMap: Array<ErrorDetails>;
  private securityDetails: SecurityDetails;
  private securityDetailsMaxLength = 255;
  private submitted = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private backService: BackService,
    private errorSummaryService: ErrorSummaryService,
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private router: Router
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
          this.securityDetails = securityDetails;
          this.preFillForm();
        }
      })
    );
  }

  private preFillForm(): void {
    if (this.securityDetails) {
      this.getSecurityQuestion.setValue(this.securityDetails.securityQuestion);
      this.getSecurityAnswer.setValue(this.securityDetails.securityAnswer);
    }
  }

  private setCallToActionLabel(): void {
    const label: string = this.securityDetails ? 'Save and return' : 'Continue';
    this.callToActionLabel = label;
  }

  private setBackLink(): void {
    const route: string = this.securityDetails
      ? '/registration/confirm-account-details'
      : '/registration/create-username';
    this.backService.setBackLink({ url: [route] });
  }

  private setupForm(): void {
    this.form = this.fb.group({
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
