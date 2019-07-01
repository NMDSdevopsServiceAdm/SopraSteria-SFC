import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { IdleService } from '@core/services/idle.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  public fullname: string;
  public showDropdown = false;

  constructor(private authService: AuthService, private idleService: IdleService) {}

  ngOnInit() {
    this.fullname = this.authService.fullname ? this.authService.fullname.split(' ')[0] : null;
  }

  public isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  public toggleMenu(): void {
    this.showDropdown = !this.showDropdown;
  }

  public signOut(event): void {
    event.preventDefault();
    this.idleService.clear();
    this.authService.logout();
  }
}
