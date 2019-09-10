import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EMAIL_PATTERN, PHONE_PATTERN } from '@core/constants/constants';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { URLStructure } from '@core/model/url.model';
import { UserDetails } from '@core/model/userDetails.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { Subscription } from 'rxjs';

export class AccountDetails implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl', { static: false }) formEl: ElementRef;
  protected back: URLStructure;
  protected formErrorsMap: Array<ErrorDetails>;
  protected serverError: string;
  protected serverErrorsMap: Array<ErrorDefinition>;
  protected subscriptions: Subscription = new Subscription();
  public callToActionLabel = 'Continue';
  public form: FormGroup;
  public formControlsMap: any[] = [
    {
      label: 'Your full name',
      name: 'fullname',
    },
    {
      label: 'Your job title',
      name: 'jobTitle',
    },
    {
      label: 'Your email address',
      name: 'email',
    },
    {
      label: 'Contact phone number',
      name: 'phone',
    },
  ];
  public submitted = false;
  public return: URLStructure;

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
    protected router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      fullname: ['', [Validators.required, Validators.maxLength(120)]],
      jobTitle: ['', [Validators.required, Validators.maxLength(120)]],
      email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN), Validators.maxLength(120)]],
      phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    });

    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.setBackLink();
    this.init();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected init() {}

  protected setUserDetails(): UserDetails {
    return {
      email: this.form.get(this.formControlsMap[2].name).value,
      fullname: this.form.get(this.formControlsMap[0].name).value,
      jobTitle: this.form.get(this.formControlsMap[1].name).value,
      phone: this.form.get(this.formControlsMap[3].name).value,
    };
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'fullname',
        type: [
          {
            name: 'required',
            message: 'Please enter your full name.',
          },
          {
            name: 'maxlength',
            message: 'Your fullname must be no longer than 120 characters.',
          },
        ],
      },
      {
        item: 'jobTitle',
        type: [
          {
            name: 'required',
            message: 'Please enter your job title.',
          },
          {
            name: 'maxlength',
            message: 'Your job title must be no longer than 120 characters.',
          },
        ],
      },
      {
        item: 'email',
        type: [
          {
            name: 'required',
            message: 'Please enter your email address.',
          },
          {
            name: 'maxlength',
            message: 'Your email address must be no longer than 120 characters.',
          },
          {
            name: 'pattern',
            message: 'Please enter a valid email address.',
          },
        ],
      },
      {
        item: 'phone',
        type: [
          {
            name: 'required',
            message: 'Please enter your contact phone number.',
          },
          {
            name: 'pattern',
            message: 'Invalid contact phone number.',
          },
        ],
      },
    ];
  }

  public setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 404,
        message: 'User not found or does not belong to the given establishment.',
      },
      {
        name: 400,
        message: 'Unable to create user.',
      },
    ];
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit() {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.save();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  protected prefillForm(userDetails: UserDetails): void {
    if (userDetails) {
      this.form.setValue({
        email: userDetails.email,
        fullname: userDetails.fullname,
        jobTitle: userDetails.jobTitle,
        phone: userDetails.phone,
      });
    }
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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
