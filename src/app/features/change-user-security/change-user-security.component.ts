import { Component, OnInit, OnDestroy } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from '../../core/services/user.service';
import { Subscription } from 'rxjs';
import { UserDetails } from '@core/model/userDetails.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';

@Component({
  selector: 'app-change-user-security',
  templateUrl: './change-user-security.component.html',
})
export class ChangeUserSecurityComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public submitted: boolean;
  public userDetails: UserDetails;

  private username: string;
  private uid: string;
  private securityQuestion: string;
  private securityAnswer: string;
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

  // Get Security Question
  get getSecurityQuestionInput() {
    return this.form.get('securityQuestionInput');
  }

  // Get Security Answer
  get getSecurityAnswerInput() {
    return this.form.get('securityAnswerInput');
  }

  ngOnInit() {
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
      this.username = this.userDetails['username'];
      this.uid = this.userDetails['uid'];

      this.securityQuestion = this.userDetails['securityQuestion'];
      this.securityAnswer = this.userDetails['securityQuestionAnswer'];

      this.form.setValue({
        securityQuestionInput: this.securityQuestion,
        securityAnswerInput: this.securityAnswer,
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
      const data = {
        securityQuestion: this.form.value.securityQuestionInput,
        securityQuestionAnswer: this.form.value.securityAnswerInput,
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
