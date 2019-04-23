import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { AuthService } from '@core/services/auth-service';
import { EstablishmentService } from '@core/services/establishment.service';
import { IdleService } from '@core/services/idle.service';
import { Subscription } from 'rxjs';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { HttpErrorResponse } from '@angular/common/http';

const PING_INTERVAL = 240;
const TIMEOUT_INTERVAL = 1800;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  login: LoginCredentials;
  public submitted = false;
  private subscriptions: Subscription = new Subscription();
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

    this.subscriptions.add(this.authService.auth$.subscribe(login => (this.login = login)));
    this.setupFormErrorsMap();
    this.setupServerErrorsMap();
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
        message: 'User unauthorised - username or password is incorrect.',
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
      this.save();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
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

  private save(): void {
    this.login.username = this.form.get('username').value;
    this.login.password = this.form.get('password').value;

    this.subscriptions.add(
      this.authService.postLogin(this.login).subscribe(
        response => {
          this.authService.updateState(response.body);

          // // update the establishment service state with the given establishment oid
          this.establishmentService.establishmentId = response.body.establishment.id;

          const token = response.headers.get('authorization');
          this.authService.authorise(token);
          this.authService.authorise(token);

          this.idleService.init(PING_INTERVAL, TIMEOUT_INTERVAL);
          this.idleService.start();

          this.idleService.ping$.subscribe(() => {
            this.authService.refreshToken().subscribe(res => {
              this.authService.authorise(res.headers.get('authorization'));
            });
          });

          this.idleService.onTimeout().subscribe(() => {
            this.authService.logoutWithoutRouting();
            this.router.navigate(['/logged-out']);
          });
        },
        (error: HttpErrorResponse) => {
          this.form.setErrors({ serverError: true });
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
        },
        () => {
          const redirect = this.authService.redirect;

          if (redirect && redirect.url.length) {
            const navExtras: NavigationExtras = {
              queryParams: redirect.queryParams,
              fragment: redirect.fragment,
            };

            this.authService.redirect = null;
            this.router.navigate([redirect.url.toString()], navExtras);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }
      )
    );
  }
}
