/*eslint @typescript-eslint/no-empty-function: ["error", { allow: ['methods'] }]*/
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EMAIL_PATTERN, PHONE_PATTERN } from '@core/constants/constants';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { URLStructure } from '@core/model/url.model';
import { UserDetails } from '@core/model/userDetails.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { ProgressBarUtil } from '@core/utils/progress-bar-util';
import { Subscription } from 'rxjs';

@Directive()
export abstract class AccountDetailsDirective implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition>;
  public callToActionLabel = 'Continue';
  public form: FormGroup;
  public formControlsMap: any[] = [
    {
      label: 'Full name',
      name: 'fullname',
    },
    {
      label: 'Job title',
      name: 'jobTitle',
    },
    {
      label: 'Email address',
      name: 'email',
    },
    {
      label: 'Phone number',
      name: 'phone',
    },
  ];
  public submitted = false;
  public return: URLStructure;
  protected back: URLStructure;
  public formErrorsMap: Array<ErrorDetails>;
  protected subscriptions: Subscription = new Subscription();
  public workplaceSections: string[];
  public userAccountSections: string[];
  public insideFlow: boolean;
  public flow: string;

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      fullname: ['', { validators: [Validators.required, Validators.maxLength(120)], updateOn: 'submit' }],
      jobTitle: ['', { validators: [Validators.required, Validators.maxLength(120)], updateOn: 'submit' }],
      email: [
        '',
        {
          validators: [Validators.required, Validators.pattern(EMAIL_PATTERN), Validators.maxLength(120)],
          updateOn: 'submit',
        },
      ],
      phone: ['', { validators: [Validators.required, Validators.pattern(PHONE_PATTERN)], updateOn: 'submit' }],
    });

    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.init();
    this.setBackLink();
    this.workplaceSections = ProgressBarUtil.workplaceProgressBarSections();
    this.userAccountSections = ProgressBarUtil.userProgressBarSections();
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected init(): void {}

  protected setUserDetails(): UserDetails {
    return {
      email: this.form.get(this.formControlsMap[2].name).value,
      fullname: this.form.get(this.formControlsMap[0].name).value,
      jobTitle: this.form.get(this.formControlsMap[1].name).value,
      phone: this.form.get(this.formControlsMap[3].name).value,
    };
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'fullname',
        type: [
          {
            name: 'required',
            message: 'Enter your full name',
          },
          {
            name: 'maxlength',
            message: 'Full name must be 120 characters or fewer',
          },
        ],
      },
      {
        item: 'jobTitle',
        type: [
          {
            name: 'required',
            message: 'Enter your job title',
          },
          {
            name: 'maxlength',
            message: 'Job title must be 120 characters or fewer',
          },
        ],
      },
      {
        item: 'email',
        type: [
          {
            name: 'required',
            message: 'Enter an email address',
          },
          {
            name: 'maxlength',
            message: 'Email address must be 120 characters or fewer',
          },
          {
            name: 'pattern',
            message: 'Enter the email address in the correct format, like name@example.com',
          },
        ],
      },
      {
        item: 'phone',
        type: [
          {
            name: 'required',
            message: 'Enter a phone number',
          },
          {
            name: 'pattern',
            message: 'Enter the phone number like 01632 960 001, 07700 900 982 or +44 0808 157 0192',
          },
        ],
      },
    ];
  }

  public setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 404,
        message: 'User not found or does not belong to the given establishment',
      },
      {
        name: 400,
        message: 'Unable to create user',
      },
    ];
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
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

  protected prefillForm(userDetails: UserDetails): void {
    this.form.setValue({
      email: userDetails.email,
      fullname: userDetails.fullname,
      jobTitle: userDetails.jobTitle,
      phone: userDetails.phone,
    });
  }

  protected onError(response: HttpErrorResponse): void {
    if (response.status === 400) {
      this.serverErrorsMap[1].message = response.error;
    }

    this.serverError = this.errorSummaryService.getServerErrorMessage(response.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }

  protected save(): void {}

  protected setBackLink(): void {}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
