import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { IdleService } from '@core/services/idle.service';

import { LoginApiModel } from '../../core/model/loginApi.model';
import { AuthService } from '../../core/services/auth-service';
import { EstablishmentService } from '../../core/services/establishment.service';
import { MessageService } from '../../core/services/message.service';

const PING_INTERVAL = 240;
const TIMEOUT_INTERVAL = 1800;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  // loginUser = new LoginUser();

  login: LoginApiModel;

  // Login values
  usernameValue: string;
  userPasswordValue: string;

  private subscriptions = [];

  // Set up Validation messages
  usernameMessage: string;
  passwordMessage: string;

  constructor(
    private idleService: IdleService,
    private _loginService: AuthService,
    private establishmentService: EstablishmentService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  // Get user fullname
  get getUsernameInput() {
    return this.loginForm.get('username');
  }

  // Get user job title
  get getPasswordInput() {
    return this.loginForm.get('password');
  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(120)]],
      password: ['', [Validators.required, Validators.maxLength(120)]],
    });

    this.subscriptions.push(
      this.loginForm.valueChanges.subscribe(value => {
        if (this.loginForm.valid) {
          this.messageService.clearError();
        }
      })
    );

    this.subscriptions.push(this._loginService.auth$.subscribe(login => (this.login = login)));
  }

  onSubmit() {
    this.usernameValue = this.getUsernameInput.value;
    this.userPasswordValue = this.getPasswordInput.value;

    if (this.loginForm.invalid) {
      this.messageService.clearError();
      this.messageService.show('error', 'Please fill the required fields.');
    } else {
      this.save();
    }
  }

  save() {
    this.login.username = this.usernameValue;
    this.login.password = this.userPasswordValue;
    this.messageService.clearError();

    this.subscriptions.push(
      this._loginService.postLogin(this.login).subscribe(
        response => {
          this._loginService.updateState(response.body);

          // // update the establishment service state with the given establishment oid
          this.establishmentService.establishmentId = response.body.establishment.id;

          const token = response.headers.get('authorization');
          this._loginService.authorise(token);

          this.idleService.init(PING_INTERVAL, TIMEOUT_INTERVAL);
          this.idleService.start();

          this.idleService.ping$.subscribe(() => {
            this._loginService.refreshToken().subscribe(res => {
              this._loginService.authorise(response.headers.get('authorization'));
            });
          });

          this.idleService.onTimeout().subscribe(() => {
            this._loginService.logoutWithoutRouting();
            this.router.navigate(['/logged-out']);
          });
        },
        err => {
          const message = err.error.message || 'Invalid username or password.';
          this.messageService.show('error', message);
        },
        () => {
          const redirectUrl = this._loginService.redirectUrl;

          if (redirectUrl) {
            const navExtras: NavigationExtras = {
              queryParamsHandling: 'preserve',
              preserveFragment: true,
            };

            this._loginService.redirectUrl = null;
            this.router.navigate([redirectUrl], navExtras);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.messageService.clearAll();
  }
}
