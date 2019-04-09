import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { LoginApiModel } from '@core/model/loginApi.model';
import { AuthService } from '@core/services/auth-service';
import { EstablishmentService } from '@core/services/establishment.service';
import { IdleService } from '@core/services/idle.service';
import { Subscription } from 'rxjs';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';

const PING_INTERVAL = 240;
const TIMEOUT_INTERVAL = 1800;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  login: LoginApiModel;
  public submitted = false;
  private subscriptions: Subscription = new Subscription();
  public errorDetails: Array<ErrorDetails>;

  constructor(
    private idleService: IdleService,
    private authService: AuthService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private formBuilder: FormBuilder,
    private errorSummaryService: ErrorSummaryService,
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      username: [null, Validators.required],
      password: [null, Validators.required],
    });

    this.subscriptions.add(this.authService.auth$.subscribe(login => (this.login = login)));
    this.setupErrorDetails();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public setupErrorDetails(): void {
    this.errorDetails = [
      {
        item: 'username',
        type: [
          {
            name: 'required',
            message: 'Please enter your username.',
          }
        ]
      },
      {
        item: 'password',
        type: [
          {
            name: 'required',
            message: 'Please enter your password.',
          }
        ]
      }
    ];
  }

  onSubmit() {
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
  public getErrorMessage(item: string, errorType: string): string {
    return this.errorSummaryService.getErrorMessage(item, errorType, this.errorDetails);
  }

  save() {
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
        error => {
          this.form.setErrors({ serverError: true });
        },
        () => {
          const redirect = this.authService.redirect;

          if (redirect) {
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
