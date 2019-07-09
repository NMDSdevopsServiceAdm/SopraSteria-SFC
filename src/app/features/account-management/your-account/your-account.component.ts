import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserDetails } from '@core/model/userDetails.model';
import { AuthService } from '@core/services/auth.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-your-account-summary',
  templateUrl: './your-account.component.html',
})
export class YourAccountComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public establishment: any;
  public user: UserDetails;
  public username: string;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private breadcrumbService: BreadcrumbService
  ) {}

  ngOnInit() {
    this.breadcrumbService.show();
    this.establishment = this.authService.establishment.id;
    this.getUsername();
  }

  private getUsername() {
    this.subscriptions.add(
      this.userService.getUsernameFromEstbId().subscribe(data => {
        this.username = data.users[0].username;
        this.getUserSummary();
      })
    );
  }

  private getUserSummary() {
    this.subscriptions.add(
      this.userService.getUserDetails(this.username).subscribe((userDetails: UserDetails) => {
        this.user = userDetails;
        this.userService.updateState(userDetails);
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
