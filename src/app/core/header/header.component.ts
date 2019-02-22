import { Component } from '@angular/core';
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  constructor(private authService: AuthService) {}

  isLoggedIn() {
    return this.authService.isLoggedIn;
  }

  signOut(event) {
    event.preventDefault();
    this.authService.logout();
  }
}
