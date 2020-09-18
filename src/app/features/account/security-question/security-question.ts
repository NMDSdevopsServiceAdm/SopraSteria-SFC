import { AfterViewInit, ElementRef, OnDestroy, OnInit, ViewChild, Directive } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { SecurityDetails } from '@core/model/security-details.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { Subscription } from 'rxjs';

@Directive()
export class SecurityQuestion implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public formErrorsMap: Array<ErrorDetails>;
  public callToActionLabel: string;
  public form: FormGroup;
  public submitted = false;
  public return: URLStructure;
  public formControlsMap: any[] = [
    {
      label: 'Enter a security question',
      name: 'securityQuestion',
    },
    {
      label: 'Enter the answer to the security question',
      name: 'securityQuestionAnswer',
    },
  ];
  protected back: URLStructure;
  protected subscriptions: Subscription = new Subscription();
  private securityDetailsMaxLength = 255;

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
  ) {}

  // Get security question
  get getSecurityQuestion() {
    return this.form.get('securityQuestion');
  }

  // Get security answer
  get getSecurityQuestionAnswer() {
    return this.form.get('securityQuestionAnswer');
  }

  ngOnInit() {
    this.setupForm();
    this.setupSubscription();
    this.setupFormErrorsMap();
    this.init();
    this.setCallToActionLabel();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected init(): void {}

  protected setupSubscription(): void {}

  protected preFillForm(securityDetails: SecurityDetails): void {
    if (securityDetails) {
      this.getSecurityQuestion.setValue(securityDetails.securityQuestion);
      this.getSecurityQuestionAnswer.setValue(securityDetails.securityQuestionAnswer);
    }
  }

  protected setCallToActionLabel(): void {}

  private setupForm(): void {
    this.form = this.formBuilder.group({
      securityQuestion: ['', [Validators.required, Validators.maxLength(this.securityDetailsMaxLength)]],
      securityQuestionAnswer: ['', [Validators.required, Validators.maxLength(this.securityDetailsMaxLength)]],
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
        item: 'securityQuestionAnswer',
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
