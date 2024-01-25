import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { AuthService } from '@core/services/auth.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { IdleService } from '@core/services/idle.service';
import { UserService } from '@core/services/user.service';
import { isAdminRole } from '@core/utils/check-role-util';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  private subscriptions: Subscription = new Subscription();
  public form: UntypedFormGroup;
  public submitted = false;
  public formErrorsMap: Array<ErrorDetails>;
  public serverErrorsMap: Array<ErrorDefinition>;
  public serverError: string;

  constructor(
    private idleService: IdleService,
    private authService: AuthService,
    private userService: UserService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private formBuilder: UntypedFormBuilder,
    private errorSummaryService: ErrorSummaryService,
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      username: [null, { validators: [Validators.required], updateOn: 'submit' }],
      password: [null, { validators: [Validators.required], updateOn: 'submit' }],
    });

    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'username',
        type: [
          {
            name: 'required',
            message: 'Enter your username',
          },
        ],
      },
      {
        item: 'password',
        type: [
          {
            name: 'required',
            message: 'Enter your password',
          },
        ],
      },
    ];
  }

  public setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 401,
        message: 'Your username or your password is incorrect',
      },
      {
        name: 500,
        message: 'Unable to authenticate user.',
      },
      {
        name: 409,
        message: 'There is a problem with your account, please contact support on 0113 241 0969',
      },
      {
        name: 405,
        message: 'Your registration request is awaiting approval, please contact support on 0113 241 0969',
      },
    ];
  }

  public onSubmit(): void {
    this.submitted = true;
    this.serverError = null;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.login();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  public getFormErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  private login(): void {
    const { username, password } = this.form.value;

    this.subscriptions.add(
      this.authService.authenticate(username, password).subscribe(
        (response) => {
          if (response.body.establishment && response.body.establishment.uid) {
            // update the establishment service state with the given establishment id
            this.establishmentService.establishmentId = response.body.establishment.uid;
          }
          if (isAdminRole(response.body.role)) {
            this.userService.agreedUpdatedTerms = true; // skip term & condition check for admin user
            this.router.navigate(['/sfcadmin']);
          } else {
            this.userService.agreedUpdatedTerms = response.body.agreedUpdatedTerms;
            if (this.authService.isPreviousUser(username) && this.authService.redirectLocation) {
              this.router.navigateByUrl(this.authService.redirectLocation);
            } else {
              if (response.body.establishment.employerTypeSet === false) {
                this.establishmentService.setEmployerTypeHasValue(false);
                this.router.navigate(['workplace', `${response.body.establishment.uid}`, 'type-of-employer']);
              } else {
                this.router.navigate(['/dashboard']);
              }
            }
            this.authService.clearPreviousUser();

            if (response.body.migratedUserFirstLogon || !this.userService.agreedUpdatedTerms) {
              this.router.navigate(['/migrated-user-terms-and-conditions']);
            }

            if (response.body.registrationSurveyCompleted === false) {
              this.router.navigate(['/registration-survey']);
            }
          }
        },
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
        },
      ),
    );
  }
}
