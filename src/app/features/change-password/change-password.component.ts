import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserDetails } from '@core/model/userDetails.model';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  public submitted: boolean;
  public userDetails: UserDetails;
  private subscriptions: Subscription = new Subscription();

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.submitted = false;

    this.subscriptions.add(
      this.userService.userDetails$.subscribe((userDetails: UserDetails) => this.userDetails = userDetails)
    );
  }

  public onResetPasswordSuccess(): void {
    this.submitted = true;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
