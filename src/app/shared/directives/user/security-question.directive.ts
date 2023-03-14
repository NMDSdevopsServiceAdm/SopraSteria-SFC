import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { SecurityDetails } from '@core/model/security-details.model';
import { URLStructure } from '@core/model/url.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { Subscription } from 'rxjs';

/*eslint @typescript-eslint/no-empty-function: ["error", { allow: ['methods'] }]*/
@Directive()
export abstract class SecurityQuestionDirective implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public formErrorsMap: Array<ErrorDetails>;
  public callToActionLabel: string;
  public form: FormGroup;
  public submitted = false;
  public return: URLStructure;
  public formControlsMap: any[] = [
    {
      label: 'Security question',
      name: 'securityQuestion',
    },
    {
      label: 'Answer',
      name: 'securityQuestionAnswer',
    },
  ];
  protected back: URLStructure;
  protected subscriptions: Subscription = new Subscription();
  private securityDetailsMaxLength = 255;

  constructor(
    protected backLinkService: BackLinkService,
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
    const questionAnswerSpec = ['', [Validators.required, Validators.maxLength(this.securityDetailsMaxLength)]];
    this.form = this.formBuilder.group(
      {
        securityQuestion: questionAnswerSpec,
        securityQuestionAnswer: questionAnswerSpec,
      },
      { updateOn: 'submit' },
    );
  }

  private setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'securityQuestion',
        type: [
          {
            name: 'required',
            message: 'Enter a security question',
          },
          {
            name: 'maxlength',
            message: `Security question must be ${this.securityDetailsMaxLength} characters or fewer`,
          },
        ],
      },
      {
        item: 'securityQuestionAnswer',
        type: [
          {
            name: 'required',
            message: 'Enter your answer to the security question',
          },
          {
            name: 'maxlength',
            message: `Answer must be ${this.securityDetailsMaxLength} characters or fewer`,
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

  protected setBackLink(): void {}
}
