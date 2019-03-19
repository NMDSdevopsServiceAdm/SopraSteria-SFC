import { Component } from '@angular/core';
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  public fullname: string;

  constructor(private authService: AuthService) {}

  isLoggedIn() {
    return this.authService.isLoggedIn;
  }

  hasFullname() {
    return this.fullname = this.authService.fullname;
  }

  signOut(event) {
    event.preventDefault();
    this.authService.logout();
  }
}
