import { Component, OnInit, OnDestroy } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from '../../core/services/user.service';
import { Subscription } from 'rxjs';
import { UserDetails } from '@core/model/userDetails.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-change-user-details',
  templateUrl: './change-user-details.component.html',
})
export class ChangeUserDetailsComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public submitted: boolean;
  public userDetails: UserDetails;

  private username: string;
  private uid: string;
  private fullname: string;
  private jobTitle: string;
  private email: string;
  private phone: string;
  public formErrorsMap: Array<ErrorDetails>;
  public serverErrorsMap: Array<ErrorDefinition>;
  public serverError: string;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private errorSummaryService: ErrorSummaryService
  ) {}

  // Get fullname
  get getUserFullnameInput() {
    return this.form.get('userFullnameInput');
  }

  // Get job title
  get getUserJobTitle() {
    return this.form.get('userJobTitleInput');
  }

  // Get email
  get getUserEmailInput() {
    return this.form.get('userEmailInput');
  }

  // Get phone
  get getUserPhoneInput() {
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

    this.subscriptions.add(
      this.userService.userDetails$.subscribe((userDetails: UserDetails) => (this.userDetails = userDetails))
    );

    this.setUserDetails();
    this.submitted = false;
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
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

  private setUserDetails(): void {
    if (this.userDetails) {
      this.username = this.userDetails['username'];
      this.uid = this.userDetails['uid'];

      this.fullname = this.userDetails['fullname'];
      this.jobTitle = this.userDetails['jobTitle'];
      this.email = this.userDetails['email'];
      this.phone = this.userDetails['phone'];

      this.form.setValue({
        userFullnameInput: this.fullname,
        userJobTitleInput: this.jobTitle,
        userEmailInput: this.email,
        userPhoneInput: this.phone,
      });
    }
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

  private changeUserDetails(data: Object): void {
    this.subscriptions.add(
      this.userService.updateUserDetails(this.username, data).subscribe(
        () => this.router.navigate(['/your-account']),
        (error: HttpErrorResponse) => {
          this.form.setErrors({ serverError: true });
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
        }
      )
    );
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      const data: Object = {
        fullname: this.form.value.userFullnameInput,
        jobTitle: this.form.value.userJobTitleInput,
        email: this.form.value.userEmailInput,
        phone: this.form.value.userPhoneInput,
      };
      this.changeUserDetails(data);
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
