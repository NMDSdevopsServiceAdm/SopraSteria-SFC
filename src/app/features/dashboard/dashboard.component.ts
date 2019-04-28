import { Component, OnInit } from '@angular/core';
import { DATE_DISPLAY_DEFAULT } from '@core/constants/constants';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  public establishment: any;
  public lastLoggedIn = null;
  public dateFormat = DATE_DISPLAY_DEFAULT;

  constructor(private authService: AuthService, private userService: UserService) {}

  ngOnInit() {
    this.establishment = this.authService.establishment;
    this.lastLoggedIn = this.authService.lastLoggedIn;
  }
}
