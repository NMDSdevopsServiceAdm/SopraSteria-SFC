import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { EstablishmentService } from '../../core/services/establishment.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
})
export class HomepageComponent implements OnInit, OnDestroy {
  constructor(
    private _loginService: AuthService,
    private establishmentService: EstablishmentService,
    private router: Router
  ) {}

  addWorkerBtnAvailable: boolean;

  private subscriptions = [];

  get fullname(): string {
    return this._loginService.fullname == null ? 'TODO' : this._loginService.fullname;
  }
  get establishmentName(): string {
    return this._loginService.establishment.name == null ? 'TODO' : this._loginService.establishment.name;
  }
  get establishmentNmdsId(): string {
    return this._loginService.establishment.nmdsId == null ? 'TODO' : this._loginService.establishment.nmdsId;
  }

  get isFirstLoggedIn(): boolean {
    return this._loginService.isFirstLogin == null ? false : this._loginService.isFirstLogin;
  }

  welcomeContinue() {
    this._loginService.resetFirstLogin();
    this.router.navigate(['/type-of-employer']);
  }

  tryagin() {
    this.router.navigate(['/type-of-employer']);
  }

  addWorker() {
    this.router.navigate(['/worker/start-screen']);
  }

  ngOnInit() {
    this.subscriptions.push(
      this.establishmentService.getStaff().subscribe(numberOfStaff => {
        this.addWorkerBtnAvailable = !!numberOfStaff;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
