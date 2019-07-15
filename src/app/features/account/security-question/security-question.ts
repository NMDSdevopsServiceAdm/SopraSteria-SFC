import { BackService } from '@core/services/back.service';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SecurityDetails } from '@core/model/security-details.model';
import { Subscription } from 'rxjs';

export class SecurityQuestion implements OnInit, OnDestroy {
  private formErrorsMap: Array<ErrorDetails>;
  private securityDetailsMaxLength = 255;
  protected securityDetailsExist = false;
  protected subscriptions: Subscription = new Subscription();
  public callToActionLabel: string;
  public form: FormGroup;
  public submitted = false;
  public formControlsMap: any[] = [
    {
      label: 'Enter a security question',
      name: 'securityQuestion'
    },
    {
      label: 'Enter the answer to the security question',
      name: 'securityAnswer'
    },
  ];

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
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
    this.setupSubscription();
    this.setupFormErrorsMap();
    this.setCallToActionLabel();
    this.init();
  }

  protected init(): void {}

  protected setupSubscription(): void {}

  protected preFillForm(securityDetails: SecurityDetails): void {
    if (securityDetails) {
      this.getSecurityQuestion.setValue(securityDetails.securityQuestion);
      this.getSecurityAnswer.setValue(securityDetails.securityAnswer);
    }
  }

  protected setCallToActionLabel(): void {}

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

  protected save(): void {}

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  /**
   * Unsubscribe hook to ensure no memory leaks
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
