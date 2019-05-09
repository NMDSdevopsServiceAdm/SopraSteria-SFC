import { AuthService } from '@core/services/auth.service';
import { BackService } from '@core/services/back.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserDetails } from '@core/model/userDetails.model';
import { UserService } from '@core/services/user.service';

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
    protected backService: BackService
  ) {}

  ngOnInit() {
    this.establishment = this.authService.establishment.id;
    this.getUsername();
    this.setBackLink();
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

  private setBackLink(): void {
    this.backService.setBackLink({ url: ['/dashboard'] });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
