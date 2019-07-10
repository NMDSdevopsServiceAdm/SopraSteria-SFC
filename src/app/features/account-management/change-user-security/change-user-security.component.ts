import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { UserDetails } from '@core/model/userDetails.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-change-user-security',
  templateUrl: './change-user-security.component.html',
})
export class ChangeUserSecurityComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public formErrorsMap: Array<ErrorDetails>;
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition>;
  public submitted: boolean;
  public userDetails: UserDetails;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private errorSummaryService: ErrorSummaryService,
    private breadcrumbService: BreadcrumbService
  ) {}

  // Get Security Question
  get getSecurityQuestionInput() {
    return this.form.get('securityQuestionInput');
  }

  // Get Security Answer
  get getSecurityAnswerInput() {
    return this.form.get('securityAnswerInput');
  }

  ngOnInit() {
    this.breadcrumbService.show();

    this.form = this.fb.group({
      securityQuestionInput: ['', [Validators.required, Validators.maxLength(255)]],
      securityAnswerInput: ['', [Validators.required, Validators.maxLength(255)]],
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
        item: 'securityQuestionInput',
        type: [
          {
            name: 'required',
            message: 'Please enter your security question.',
          },
          {
            name: 'maxlength',
            message: 'The security question must be no longer than 255 characters.',
          },
        ],
      },
      {
        item: 'securityAnswerInput',
        type: [
          {
            name: 'required',
            message: 'Please enter your security answer.',
          },
          {
            name: 'maxlength',
            message: 'The security answer must be no longer than 255 characters.',
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
      this.form.setValue({
        securityQuestionInput: this.userDetails['securityQuestion'],
        securityAnswerInput: this.userDetails['securityAnswer'],
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

  private changeUserDetails(userDetails: UserDetails): void {
    this.subscriptions.add(
      this.userService.updateUserDetails(userDetails).subscribe(
        () => this.router.navigate(['/account-management']),
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
      (this.userDetails.securityQuestion = this.form.value.securityQuestionInput),
        (this.userDetails.securityAnswer = this.form.value.securityAnswerInput),
        this.changeUserDetails(this.userDetails);
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
