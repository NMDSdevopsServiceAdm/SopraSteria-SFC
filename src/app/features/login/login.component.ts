import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { LoginApiModel } from '@core/model/loginApi.model';
import { AuthService } from '@core/services/auth-service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  login: LoginApiModel;
  public submitted = false;
  private subscriptions: Subscription = new Subscription();

  // Set up Validation messages
  usernameMessage: string;
  passwordMessage: string;

  constructor(
    private authService: AuthService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      username: [null, Validators.required],
      password: [null, Validators.required],
    });

    this.subscriptions.add(this.authService.auth$.subscribe(login => (this.login = login)));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.valid) {
      this.save();
    }
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
        },
        error => {
          this.form.setErrors({ serverError: true });
        },
        () => {
          const redirectUrl = this.authService.redirectUrl;

          if (redirectUrl) {
            const navExtras: NavigationExtras = {
              queryParamsHandling: 'preserve',
              preserveFragment: true,
            };

            this.authService.redirectUrl = null;
            this.router.navigate([redirectUrl], navExtras);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }
      )
    );
  }
}
