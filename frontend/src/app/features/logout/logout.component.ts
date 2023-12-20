import { Component } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from '@core/services/auth.service';
import { IdleService } from '@core/services/idle.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
})
export class LogoutComponent {
  private jwt = new JwtHelperService();

  constructor(private idleService: IdleService, private authService: AuthService) {
    if (this.authService.token) {
      console.log('Checking token in logged out page');
      if (this.jwt.isTokenExpired(this.authService.token)) {
        this.authService.logout();
      }
    }
    this.authService.logoutWithoutRouting();
    this.idleService.clear();
  }
}
