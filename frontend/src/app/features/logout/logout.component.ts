import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from '@core/services/auth.service';
import { IdleService } from '@core/services/idle.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  standalone: false,
})
export class LogoutComponent {
  private jwt = new JwtHelperService();
  public got403FromServer: boolean = false;

  constructor(
    private idleService: IdleService,
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {
    this.got403FromServer = this.route?.snapshot?.data?.got403FromServer ?? false;

    if (this.authService.token) {
      if (this.jwt.isTokenExpired(this.authService.token)) {
        this.authService.frontendLogout();
      }
    }
    this.authService.frontendLogoutWithoutRouting();
    this.idleService.clear();
  }
}
