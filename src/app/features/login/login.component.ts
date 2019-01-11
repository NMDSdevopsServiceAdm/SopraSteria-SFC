import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';

//import { LoginUser } from './login-user';

import { AuthService } from '../../core/services/auth-service';
import { EstablishmentService } from "../../core/services/establishment.service"

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
    private establishmentService: EstablishmentService,
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
  }

  onSubmit() {
    this.usernameValue = this.getUsernameInput.value;
    this.userPasswordValue = this.getPasswordInput.value;

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
        (response) => {
          this._loginService.updateState(response.body);

          // // update the establishment service state with the given establishment oid
          this.establishmentService.establishmentId = response.body.establishment.id;

          // store the authorization token
          localStorage.setItem("auth-token", response.headers.get('authorization'))
          localStorage.setItem("auth-token-expiry", response.body.expiryDate)
        },
        (err) => {
          // TODO - better handling and display of errors
          console.log(err.error);
        },
        () => {
          this.router.navigate(['/welcome']);
        }
      );

  }

}
