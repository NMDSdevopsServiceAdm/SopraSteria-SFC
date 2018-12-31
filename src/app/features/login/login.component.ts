import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';

//import { LoginUser } from './login-user';

import { AuthService } from '../../core/services/auth-service';
import { LoginApiModel } from '../../core/model/loginApi.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  //loginUser = new LoginUser();

  login: LoginApiModel;

  // Login values
  usernameValue: string;
  userPasswordValue: string;


  // Set up Validation messages
  usernameMessage: string;
  passwordMessage: string;

  constructor(
    private _loginService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder) {}

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
      password: ['', [Validators.required, Validators.maxLength(120)]]
    });

    this._loginService.auth$.subscribe(login => this.login = login);
    console.log('test');
  }

  onSubmit() {
    this.usernameValue = this.getUsernameInput.value;
    this.userPasswordValue = this.getPasswordInput.value;

    console.log(this.login);

    if (this.loginForm.invalid) {
      return;
    }
    else {
      this.save();
    }

  }

  save() {

    this.login.username = this.usernameValue;
    this.login.password = this.userPasswordValue;

    this._loginService.postLogin(this.login)
      .subscribe(
        (data: LoginApiModel) => {

            this._loginService.updateState(data);

        },
        (err) => {
          console.log(err);
        },
        () => {
          console.log('Login complete complete');
          this.router.navigate(['/welcome']);
        }
      );

  }

}
