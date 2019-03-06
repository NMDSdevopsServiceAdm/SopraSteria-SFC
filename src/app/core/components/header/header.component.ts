import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth-service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  public fullname: string;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.fullname = this.authService.fullname;
  }

  isLoggedIn() {
    return this.authService.isLoggedIn;
  }

  signOut(event) {
    event.preventDefault();
    this.authService.logout();
  }
}
