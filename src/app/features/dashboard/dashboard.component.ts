import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  public workplace: Establishment;
  public lastLoggedIn: string;

  constructor(
    private establishmentService: EstablishmentService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.establishmentService.primaryWorkplace$.subscribe(workplace => (this.workplace = workplace))
    );
    this.subscriptions.add(
      this.userService.loggedInUser$.subscribe(user => {
        if (user && user.role === 'Admin') {
          if (!this.workplace) {
            this.router.navigate(['/search-users']);
            return false;
          }
        }
      })
    );

    // TODO: Use user object to get last logged in date
    this.lastLoggedIn = this.authService.lastLoggedIn;
    this.userService.updateReturnUrl({
      url: ['/dashboard'],
      fragment: 'user-accounts',
    });
  }
}
