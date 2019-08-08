import { Component } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { IdleService } from '@core/services/idle.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
})
export class LogoutComponent {
  constructor(private idleService: IdleService, private authService: AuthService) {
    this.authService.logoutWithoutRouting();
    this.idleService.clear();
  }
}
