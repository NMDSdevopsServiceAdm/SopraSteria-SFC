import { BackService } from '@core/services/back.service';
import { OnDestroy, OnInit } from '@angular/core';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserDetails } from '@core/model/userDetails.model';

export class AccountDetails implements OnInit, OnDestroy {
  protected formErrorsMap: Array<ErrorDetails>;
  protected serverError: string;
  protected serverErrorsMap: Array<ErrorDefinition>;
  protected subscriptions: Subscription = new Subscription();
  protected userDetails: UserDetails;
  public callToActionLabel = 'Continue';
  public form: FormGroup;
  public formControlsMap: any[] = [
    {
      label: 'Your full name',
      name: 'fullName'
    },
    {
      label: 'Your job title',
      name: 'jobTitle'
    },
    {
      label: 'Your email address',
      name: 'email'
    },
    {
      label: 'Contact phone number',
      name: 'phone'
    },
  ];
  public submitted = false;

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
    protected router: Router,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(120)]],
      jobTitle: ['', [Validators.required, Validators.maxLength(120)]],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,4}$'),
          Validators.maxLength(120),
        ],
      ],
      phone: ['', [Validators.required, Validators.pattern('^[0-9 x(?=ext 0-9+)]{8,50}$')]],
    });

    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.setBackLink();
    this.init();
  }

  protected init() {}

  protected setUserDetails(): UserDetails {
    return (this.userDetails = {
      email: this.form.get(this.formControlsMap[2].name).value,
      fullname: this.form.get(this.formControlsMap[0].name).value,
      jobTitle: this.form.get(this.formControlsMap[1].name).value,
      phone: this.form.get(this.formControlsMap[3].name).value,
    });
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'fullName',
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

  protected save(): void {}

  protected setBackLink(): void {
    this.backService.setBackLink({ url: ['/registration/confirm-workplace-details'] });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
