import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { IdleService } from '@core/services/idle.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  public fullname: string;
  public showDropdown: boolean;

  constructor(private authService: AuthService, private idleService: IdleService) { }

  ngOnInit() {
    this.showDropdown = false;
    this.fullname = this.authService.fullname ? this.authService.fullname.split(' ')[0] : null;
  }

  isLoggedIn() {
    return this.authService.isLoggedIn;
  }

  toggleMenu() {
    return this.showDropdown = !this.showDropdown;
  }

  signOut(event) {
    event.preventDefault();
    this.idleService.clear();
    this.authService.logout();
  }
}