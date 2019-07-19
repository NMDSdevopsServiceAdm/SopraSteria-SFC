import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { AuthService } from '@core/services/auth.service';
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

  private getLoginCredentials(): LoginCredentials {
    return {
      username: this.form.get('username').value,
      password: this.form.get('password').value,
    };
  }

  private save(): void {
    this.subscriptions.add(
      this.authService.postLogin(this.getLoginCredentials()).subscribe(
        response => {
          this.authService.updateState(response.body);
          this.establishmentService.checkIfSameLoggedInUser(response.body.establishment.id);

          // update the establishment service state with the given establishment id
          this.establishmentService.establishmentId = response.body.establishment.id;

          const token = response.headers.get('authorization');
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

          if (redirect && redirect.length) {
            this.router.navigateByUrl(redirect);
            this.authService.redirect = null;
          } else {
            this.router.navigate(['/dashboard']);
          }
        }
      )
    );
  }
}
