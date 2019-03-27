import { Component, OnInit } from '@angular/core';
import { DEFAULT_DATE_DISPLAY_FORMAT } from '@core/constants/constants';
import { AuthService } from '@core/services/auth-service';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  public establishment: any;
  public lastSignedIn = null;
  public dateFormat = DEFAULT_DATE_DISPLAY_FORMAT;

  constructor(private authService: AuthService, private userService: UserService) {}

  get isFirstLoggedIn(): boolean {
    return this.authService.isFirstLogin == null ? false : this.authService.isFirstLogin;
  }

  ngOnInit() {
    this.establishment = this.authService.establishment;
    this.lastSignedIn = this.authService.lastSignedIn;
  }
}
