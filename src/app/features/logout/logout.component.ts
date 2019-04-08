import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth-service';
import { IdleService } from '@core/services/idle.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
})
export class LogoutComponent {
  constructor(private router: Router, private idleService: IdleService, private authService: AuthService) {
    this.authService.logoutWithoutRouting();
    this.idleService.clear();
  }
}
