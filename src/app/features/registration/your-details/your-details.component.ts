import { BackService } from '@core/services/back.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserDetails } from '@core/model/userDetails.model';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-your-details',
  templateUrl: './your-details.component.html',
})
export class YourDetailsComponent implements OnInit, OnDestroy {
  protected callToActionLabel = 'Continue';
  protected form: FormGroup;
  protected formErrorsMap: Array<ErrorDetails>;
  protected serverError: string;
  protected serverErrorsMap: Array<ErrorDefinition>;
  protected submitted = false;
  protected subscriptions: Subscription = new Subscription();
  protected userDetails: UserDetails;
  protected username: string;

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
    protected router: Router,
    protected userService: UserService,
  ) {}

  // Get fullname
  get getFullName() {
    return this.form.get('fullName');
  }

  // Get job title
  get getJobTitle() {
    return this.form.get('jobTitle');
  }

  // Get email
  get getEmail() {
    return this.form.get('email');
  }

  // Get phone
  get getPhone() {
    return this.form.get('phone');
  }

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
    return this.userDetails = {
      email: this.getEmail.value,
      fullname: this.getFullName.value,
      jobTitle: this.getJobTitle.value,
      phone: this.getPhone.value,
    };
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

  /**
   * Pass in formGroup or formControl name and errorType
   * Then return error message
   * @param item
   * @param errorType
   */
  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.onFormValidSubmit();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  protected onFormValidSubmit(): void {
    this.userService.updateState(this.setUserDetails());
    this.router.navigate(['/registration/create-username']);
  }

  private setBackLink(): void {
    this.backService.setBackLink({ url: ['/registration/confirm-workplace-details'] });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
