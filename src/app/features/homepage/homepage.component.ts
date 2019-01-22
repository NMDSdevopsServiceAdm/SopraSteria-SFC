import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html'
})
export class HomepageComponent implements OnInit {
  constructor(
    private _loginService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder) {}

  get fullname() : string {
    return this._loginService.fullname == null ? 'TODO' : this._loginService.fullname;
  }
  get establishmentName() : string {
    return this._loginService.establishment.name == null ? 'TODO' : this._loginService.establishment.name;
  }

  get isFirstLoggedIn() : boolean {
    return this._loginService.isFirstLogin == null ? false : this._loginService.isFirstLogin;
  }

  ngOnInit() {

  }

  welcomeContinue() {
    this._loginService.resetFirstLogin();
    this.router.navigate(['/type-of-employer']);
  }

  tryagin() {
    this.router.navigate(['/type-of-employer']);
  }

  addWorker() {
    this.router.navigate(['/worker/create-staff-record'])
  }
}
