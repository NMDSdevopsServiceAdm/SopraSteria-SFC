import { Component, OnInit } from '@angular/core';
import { LoggedInEstablishment } from '@core/model/logged-in.model';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  public establishment: LoggedInEstablishment | null;
  public lastLoggedIn: string | null;

  constructor(
    private establishmentService: EstablishmentService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.establishmentService.establishment$.pipe(take(1)).subscribe(establishment => {
      this.establishment = establishment;
    });
    this.lastLoggedIn = this.authService.lastLoggedIn;
    this.userService.updateReturnUrl({
      url: ['/dashboard'],
    });
  }
}
