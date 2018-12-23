import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../core/services/auth-service';
import { LoginApiModel } from '../../core/model/loginApi.model';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  login: LoginApiModel;

  fullname: string;

  constructor(
    private _loginService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder) {}

  ngOnInit() {
    this._loginService.auth$.subscribe(login => this.login = login);

    console.log(this.login);
    debugger;
    //this.fullname = this.login.fullname;
  }

}
