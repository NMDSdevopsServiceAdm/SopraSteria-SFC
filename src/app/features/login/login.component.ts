import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { AuthService } from '@core/services/auth.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { IdleService } from '@core/services/idle.service';
import { UserService } from '@core/services/user.service';
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
    private userService: UserService,
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
    console.log('Logging in as ' + username);
    console.log('Testing we have access to localstorage');
    localStorage.setItem('test', 'test');
    console.log(localStorage.getItem('test'));
    this.subscriptions.add(
      this.authService.authenticate(username, password).subscribe(
        response => {
          console.log('We successfully recieved a reply to the login call');
          console.log(response);
          if (response.body.establishment && response.body.establishment.uid) {
            console.log('We have the establishment information');
            // update the establishment service state with the given establishment id
            this.establishmentService.establishmentId = response.body.establishment.uid;
            this.userService.agreedUpdatedTerms = response.body.agreedUpdatedTerms;
          }

          console.log('Checking if the user has previously logged in');
          if (this.authService.isPreviousUser(username) && this.authService.redirectLocation) {
            console.log('They have so send them to where they were at: ' + this.authService.redirectLocation);
            this.router.navigateByUrl(this.authService.redirectLocation);
          } else {
            console.log("They haven't, lets take them to the dashboard");
            this.router.navigate(['/dashboard']);
          }
          console.log('Clearing the previous user information, as someone else has logged in');
          this.authService.clearPreviousUser();

          console.log('Check to make sure they have accepted the terms and conditions');
          if (response.body.migratedUserFirstLogon || !response.body.agreedUpdatedTerms) {
            console.log("They haven't accepted the terms, sending them to the welcome screen");
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
