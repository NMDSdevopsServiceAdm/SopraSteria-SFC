import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { WorkplaceDataOwner } from '@core/model/my-workplaces.model';
import { Roles } from '@core/model/roles.enum';
import { AuthService } from '@core/services/auth.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { isAdminRole } from '@core/utils/check-role-util';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  private subscriptions: Subscription = new Subscription();
  public form: UntypedFormGroup;
  public submitted = false;
  public formErrorsMap: Array<ErrorDetails>;
  public serverErrorsMap: Array<ErrorDefinition>;
  public serverError: string;
  public showPassword: boolean = false;
  public showServerErrorAsLink: boolean = true;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private formBuilder: UntypedFormBuilder,
    private errorSummaryService: ErrorSummaryService,
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      username: [
        null,
        {
          validators: [Validators.required, this.checkUsernameForAtSign()],
          updateOn: 'submit',
        },
      ],
      password: [
        null,
        {
          validators: [Validators.required],
          updateOn: 'submit',
        },
      ],
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

  public checkUsernameForAtSign(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const userNameHasAtSign = /@/.test(value);

      return userNameHasAtSign ? { atSignInUsername: true } : null;
    };
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
          {
            name: 'atSignInUsername',
            message: "You've entered an @ symbol (remember, your username cannot be an email address)",
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
        message: 'There is a problem with your account, please contact the Support Team on 0113 241 0969',
      },
      {
        name: 405,
        message: 'Your registration request is awaiting approval, please contact the Support Team on 0113 241 0969',
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
          const isPreviousUser = this.authService.isPreviousUser(username);
          this.authService.clearPreviousUser();

          if (response.body.establishment?.uid) {
            this.establishmentService.establishmentId = response.body.establishment.uid;
          }

          if (isAdminRole(response.body.role)) {
            this.userService.agreedUpdatedTerms = true; // skip term & condition check for admin user
            return this.router.navigate(['/sfcadmin']);
          }

          this.userService.agreedUpdatedTerms = response.body.agreedUpdatedTerms;

          if (response.body.migratedUserFirstLogon || !this.userService.agreedUpdatedTerms) {
            return this.router.navigate(['/migrated-user-terms-and-conditions']);
          }

          if (response.body.registrationSurveyCompleted === false) {
            return this.router.navigate(['/registration-survey']);
          }

          if (isPreviousUser && this.authService.redirectLocation) {
            return this.router.navigateByUrl(this.authService.redirectLocation);
          }

          if (response.body.establishment.employerTypeSet === false) {
            this.establishmentService.setEmployerTypeHasValue(false);
            return this.router.navigate(['workplace', response.body.establishment.uid, 'type-of-employer']);
          }

          if (
            !response.body.trainingCoursesMessageViewedQuantity ||
            response.body?.trainingCoursesMessageViewedQuantity < 3
          ) {
            return this.router.navigate(['/new-training-courses']);
          }

          if (
            (!response.body.lastViewedVacanciesAndTurnoverMessage ||
              this.isOverSixMonthsAgo(response.body.lastViewedVacanciesAndTurnoverMessage)) &&
            response.body.role === Roles.Edit &&
            response.body.establishment?.dataOwner === WorkplaceDataOwner.Workplace
          ) {
            return this.router.navigate(['/update-your-vacancies-and-turnover-data']);
          }

          this.router.navigate(['/dashboard']);
        },
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          this.showServerErrorAsLink = error.status === 401;
        },
      ),
    );
  }

  public setShowPassword(event: Event): void {
    event.preventDefault();
    this.showPassword = !this.showPassword;
  }

  private isOverSixMonthsAgo(lastViewedVacanciesAndTurnoverMessageDate: string): boolean {
    const currentDate = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentDate.getMonth() - 6);

    const lastViewedDate = new Date(lastViewedVacanciesAndTurnoverMessageDate);
    return lastViewedDate < sixMonthsAgo;
  }
}
