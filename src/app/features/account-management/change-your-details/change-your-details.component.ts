import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { UserDetails } from '@core/model/userDetails.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { RegistrationService } from '@core/services/registration.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-change-your-details',
  templateUrl: './change-your-details.component.html',
})
export class ChangeYourDetailsComponent implements OnInit, OnDestroy {
  protected form: FormGroup;
  protected formErrorsMap: Array<ErrorDetails>;
  protected serverError: string;
  protected serverErrorsMap: Array<ErrorDefinition>;
  protected submitted = false;
  protected subscriptions: Subscription = new Subscription();
  protected userDetails: UserDetails;
  protected username: string;

  protected callToActionLabel = 'Save and return';
  protected registrationInProgress: boolean;

  constructor(
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected fb: FormBuilder,
    protected registrationService: RegistrationService,
    protected router: Router,
    protected userService: UserService
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
    this.setupSubscriptions();
    this.setBackLink();
  }

  protected setUserDetails(): UserDetails {
    return (this.userDetails = {
      emailAddress: this.getEmail.value,
      fullname: this.getFullName.value,
      jobTitle: this.getJobTitle.value,
      phone: this.getPhone.value,
      username: this.username,
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

  private setupSubscriptions(): void {
    this.subscriptions.add(
      this.userService.userDetails$.subscribe((userDetails: UserDetails) => {
        if (userDetails) {
          this.userDetails = userDetails;
          this.prefillForm(userDetails);
        }
      })
    );

    this.subscriptions.add(
      this.userService.getUsernameFromEstbId().subscribe(data => {
        this.username = data.users[0].username;
      })
    );
  }

  private prefillForm(userDetails: UserDetails): void {
    if (userDetails) {
      this.form.setValue({
        email: userDetails.emailAddress,
        fullName: userDetails.fullname,
        jobTitle: userDetails.jobTitle,
        phone: userDetails.phone,
      });
    }
  }

  protected updateUserDetails(): UserDetails {
    this.userDetails.emailAddress = this.getEmail.value;
    this.userDetails.fullname = this.getFullName.value;
    this.userDetails.jobTitle = this.getJobTitle.value;
    this.userDetails.phone = this.getPhone.value;

    return this.userDetails;
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
    this.changeUserDetails(this.userDetails);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  protected setBackLink(): void {
    this.backService.setBackLink({ url: ['/account-management/your-account'] });
  }

  private changeUserDetails(userDetails: UserDetails): void {
    this.subscriptions.add(
      this.userService.updateUserDetails(userDetails).subscribe(
        () => this.router.navigate(['/account-management/your-account']),
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
        }
      )
    );
  }
}
