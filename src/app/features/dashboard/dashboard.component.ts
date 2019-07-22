import { Component, OnInit } from '@angular/core';
import { LoggedInEstablishment } from '@core/model/logged-in.model';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  public workplace: LoggedInEstablishment;
  public lastLoggedIn: string;

  constructor(
    private establishmentService: EstablishmentService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.establishmentService.establishment$.subscribe(workplace => {
      this.workplace = workplace;
    });

    // TODO: Use user object to get last logged in date
    this.lastLoggedIn = this.authService.lastLoggedIn;
    this.userService.updateReturnUrl({
      url: ['/dashboard'],
      fragment: 'user-accounts',
    });
  }
}
