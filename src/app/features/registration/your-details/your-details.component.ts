import { Component, OnInit, OnDestroy } from '@angular/core';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from '@core/services/user.service';
import { UserDetails } from '@core/model/userDetails.model';

@Component({
  selector: 'app-your-details',
  templateUrl: './your-details.component.html',
})
export class YourDetailsComponent implements OnInit, OnDestroy {
  protected serverError: string;
  protected serverErrorsMap: Array<ErrorDefinition>;
  protected subscriptions: Subscription = new Subscription();
  protected username: string;
  protected form: FormGroup;
  protected formErrorsMap: Array<ErrorDetails>;
  protected submitted = false;
  protected userDetails: UserDetails;

  constructor(
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
    protected router: Router,
    protected userService: UserService
  ) {}

  // Get fullname
  get getFullName() {
    return this.form.get('userFullnameInput');
  }

  // Get job title
  get getJobTitle() {
    return this.form.get('userJobTitleInput');
  }

  // Get email
  get getEmail() {
    return this.form.get('userEmailInput');
  }

  // Get phone
  get getPhone() {
    return this.form.get('userPhoneInput');
  }

  ngOnInit() {
    this.form = this.fb.group({
      userFullnameInput: ['', [Validators.required, Validators.maxLength(120)]],
      userJobTitleInput: ['', [Validators.required, Validators.maxLength(120)]],
      userEmailInput: [
        '',
        [
          Validators.required,
          Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,4}$'),
          Validators.maxLength(120),
        ],
      ],
      userPhoneInput: ['', [Validators.required, Validators.pattern('^[0-9 x(?=ext 0-9+)]{8,50}$')]],
    });

    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
    this.setupUserDetails();
    this.init();
  }

  protected init() {}

  protected setupUserDetails(): void {
    this.userDetails = {
      email: this.getEmail.value,
      fullname: this.getFullName.value,
      jobTitle: this.getJobTitle.value,
      phone: this.getPhone.value,
    };
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'userFullnameInput',
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
        item: 'userJobTitleInput',
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
        item: 'userEmailInput',
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
        item: 'userPhoneInput',
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
    this.userService.updateState(this.userDetails);
    this.router.navigate(['/registration/create-username']);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
