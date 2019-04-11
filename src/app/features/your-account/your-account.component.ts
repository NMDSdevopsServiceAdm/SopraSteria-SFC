import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '@core/services/auth-service';
import { Subscription } from 'rxjs';
import { UserDetails } from '@core/model/userDetails.model';

@Component({
  selector: 'app-your-account-summary',
  templateUrl: './your-account.component.html',
})
export class YourAccountComponent implements OnInit, OnDestroy {
  public username: string;
  public user: UserDetails;
  public establishment: any;
  private subscriptions: Subscription = new Subscription();

  constructor(private _userService: UserService, private authService: AuthService) {}

  ngOnInit() {
    this.establishment = this.authService.establishment.id;
    this.getUsername();
  }

  getUsername() {
    this.subscriptions.add(
      this._userService.getUsernameFromEstbId().subscribe(data => {
        this.username = data.users[0].username;
        this.getUserSummary();
      })
    );
  }

  getUserSummary() {
    this.subscriptions.add(
      this._userService.getUserDetails(this.username).subscribe((data: UserDetails) => {
        this.user = data;
        this._userService.updateState(data);
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
