import { Component } from '@angular/core';
import { IdleService } from '@core/services/idle.service';

import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  public fullname: string;

  constructor(private authService: AuthService, private idleService: IdleService) {}

  isLoggedIn() {
    return this.authService.isLoggedIn;
  }

  hasFullname() {
    return (this.fullname = this.authService.fullname ? this.authService.fullname.split(' ')[0] : null);
  }

  signOut(event) {
    event.preventDefault();
    this.idleService.clear();
    this.authService.logout();
  }
}
