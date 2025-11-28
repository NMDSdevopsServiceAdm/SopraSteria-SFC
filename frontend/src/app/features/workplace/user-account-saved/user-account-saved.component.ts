import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { URLStructure } from '@core/model/url.model';
import { UserDetails } from '@core/model/userDetails.model';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-account-saved',
    templateUrl: './user-account-saved.component.html',
    standalone: false
})
export class UserAccountSavedComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();

  constructor(private userService: UserService, private route: ActivatedRoute) {}
  public userDetails: UserDetails = this.route.snapshot.data.user;
  public return: URLStructure;

  ngOnInit() {
    this.subscriptions.add(
      this.userService.returnUrl.pipe(take(1)).subscribe((returnUrl) => {
        this.return = returnUrl;
      }),
    );
  }
}
