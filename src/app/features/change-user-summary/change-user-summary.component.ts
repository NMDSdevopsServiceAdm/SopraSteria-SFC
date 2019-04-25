import { Component, OnInit, OnDestroy } from '@angular/core';

import { UserService } from '../../core/services/user.service';
import { AuthService } from '@core/services/auth-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-change-user-summary',
  templateUrl: './change-user-summary.component.html'
})
export class ChangeUserSummaryComponent implements OnInit, OnDestroy {
  public username: string;
  public user = '';
  public establishment: any;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private _userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.establishment = this.authService.establishment.id;

    this.getUsername();
  }

  getUsername() {
    this.subscriptions.add(
      this.authService.auth$.subscribe(data => {
        this.username = data.username;

        this.getUserSummary();
      })
    );
  }

  getUserSummary() {
    this.subscriptions.add(
      this._userService.getUserDetails(this.username).subscribe(data => {
        this.user = data;

        this._userService.updateState(data);

      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
