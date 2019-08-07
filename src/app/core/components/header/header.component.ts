import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserDetails } from '@core/model/userDetails.model';
import { AuthService } from '@core/services/auth.service';
import { IdleService } from '@core/services/idle.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public fullname: string;
  public user: UserDetails;
  public showDropdown = false;

  constructor(private authService: AuthService, private idleService: IdleService, private userService: UserService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.userService.loggedInUser$.subscribe(user => {
        this.user = user;
        this.fullname = user && user.fullname ? user.fullname.split(' ')[0] : null;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
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
