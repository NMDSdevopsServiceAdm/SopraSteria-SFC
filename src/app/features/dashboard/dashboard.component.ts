import { Component, OnInit } from '@angular/core';
import { LoggedInEstablishment } from '@core/model/logged-in.model';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  public workplace: LoggedInEstablishment;
  public lastLoggedIn: string;

  constructor(
    private establishmentService: EstablishmentService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {

    this.subscriptions.add(
      this.establishmentService.establishment$.subscribe(workplace => {
        this.workplace = workplace;
      })
    )

    this.subscriptions.add(
      this.userService.loggedInUser$.subscribe(user => {
        if (user && user.role === 'Admin') {
          if (!this.workplace) {
            this.router.navigate(['/search-users']);
            return false;
          } else {

            const workplaceId = localStorage.getItem('establishmentId');

            this.establishmentService
              .getEstablishment(workplaceId)
              .pipe(take(1))
              .subscribe(workplace => {
                this.workplace = workplace;
              })
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