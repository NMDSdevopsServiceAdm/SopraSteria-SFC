import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { AuthService } from '@core/services/auth.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { IdleService } from '@core/services/idle.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('formEl', { static: false }) formEl: ElementRef;
  private subscriptions: Subscription = new Subscription();
  public form: FormGroup;
  public submitted = false;
  public formErrorsMap: Array<ErrorDetails>;
  public serverErrorsMap: Array<ErrorDefinition>;
  public serverError: string;

  constructor(
    private idleService: IdleService,
    private authService: AuthService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private formBuilder: FormBuilder,
    private errorSummaryService: ErrorSummaryService
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      username: [null, Validators.required],
      password: [null, Validators.required],
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
            message: 'Please enter your username.',
          },
        ],
      },
      {
        item: 'password',
        type: [
          {
            name: 'required',
            message: 'Please enter your password.',
          },
        ],
      },
    ];
  }

  public setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 401,
        message:
          'Please Note<br>' +
          'Your registration request is awaiting approval (contact support)<br>' +
          'Or<br>' +
          'Your username / password is incorrect ' +
          '(please consider resetting your password now, 5 incorrect attempts will lock your account)',
      },
      {
        name: 404,
        message: 'User not found.',
      },
      {
        name: 503,
        message: 'Unable to authenticate user.',
      },
    ];
  }

  public onSubmit(): void {
    this.submitted = true;
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
        response => {
          if (response.body.establishment && response.body.establishment.uid) {
            // update the establishment service state with the given establishment id
            this.establishmentService.establishmentId = response.body.establishment.uid;
          }

          if (this.authService.isPreviousUser(username) && this.authService.redirectLocation) {
            this.router.navigateByUrl(this.authService.redirectLocation);
          } else {
            this.router.navigate(['/dashboard']);
          }

          this.authService.clearPreviousUser();

          if (response.body.migratedUserFirstLogon) {
            this.router.navigate(['/migrated-user-terms-and-conditions']);
          }
        },
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
        }
      )
    );
  }
}
